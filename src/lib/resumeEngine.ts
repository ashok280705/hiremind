import { canonical, SKILLS_VOCAB } from "./skillsDb";

// ── Text extraction ──────────────────────────────────────────────────────────

export async function extractText(filename: string, buffer: Buffer): Promise<string> {
  const name = filename.toLowerCase();
  if (name.endsWith(".pdf")) return extractPdf(buffer);
  if (name.endsWith(".docx")) return extractDocx(buffer);
  throw new Error(`Unsupported file type for '${filename}'. Only PDF and DOCX are supported.`);
}

async function extractPdf(buffer: Buffer): Promise<string> {
  // pdf-parse v2 exports PDFParse class
  // Usage: new PDFParse({ data: buffer }) -> getText() -> result.text
  try {
    const pdfParseModule = await import("pdf-parse");
    const PDFParse = pdfParseModule.PDFParse;
    
    if (!PDFParse || typeof PDFParse !== "function") {
      throw new Error("PDFParse class not found in pdf-parse module");
    }
    
    // Create parser instance with buffer
    const parser = new PDFParse({ data: buffer });
    
    // Extract text
    const result = await parser.getText();
    
    // Cleanup
    await parser.destroy();
    
    if (!result || typeof result.text !== "string") {
      throw new Error("PDF getText() returned invalid result structure");
    }
    
    const text = result.text.trim();
    if (!text) {
      throw new Error("No text extracted from PDF");
    }
    
    return text;
  } catch (err: any) {
    throw new Error(`Failed to parse PDF: ${err.message}`);
  }
}

async function extractDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}

// ── NLP parsing ──────────────────────────────────────────────────────────────

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const PHONE_RE = /(\+?\d[\d\s().-]{7,}\d)/;
const YEARS_RE = /(\d{1,2})\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)?/gi;
const DATE_RANGE_RE = /((?:19|20)\d{2})\s*[-–to]+\s*((?:19|20)\d{2}|present|current)/gi;
const EDUCATION_KW = ["bachelor","b.tech","btech","b.e.","bsc","b.sc","ba","master","m.tech","mtech","m.e.","msc","m.sc","mba","ma","phd","doctorate","diploma","associate"];

export interface ParsedResume {
  filename: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  skills: string[];
  experience_years: number;
  education: string[];
  raw_text: string;
}

export function parseResumeText(filename: string, text: string): ParsedResume {
  const cleaned = text.replace(/\r/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  return {
    filename,
    name: extractName(cleaned),
    email: extractEmail(cleaned),
    phone: extractPhone(cleaned),
    skills: extractSkills(cleaned),
    experience_years: extractExperienceYears(cleaned),
    education: extractEducation(cleaned),
    raw_text: cleaned,
  };
}

function extractName(text: string): string | null {
  for (const line of text.split("\n")) {
    const l = line.trim();
    if (l && l.split(" ").length <= 5 && !EMAIL_RE.test(l) && !PHONE_RE.test(l) && /^[A-Za-z]/.test(l)) {
      return l;
    }
  }
  return null;
}

function extractEmail(text: string): string | null {
  return text.match(EMAIL_RE)?.[0] ?? null;
}

function extractPhone(text: string): string | null {
  const m = text.match(PHONE_RE);
  if (!m) return null;
  const phone = m[0].replace(/[^\d+]/g, "");
  return phone.length >= 8 ? phone : null;
}

function extractSkills(text: string): string[] {
  const found = new Set<string>();
  const lower = text.toLowerCase();
  for (const skill of SKILLS_VOCAB) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const hasSpecial = /[.+#]/.test(skill);
    const pattern = hasSpecial
      ? new RegExp(`(?<![A-Za-z0-9+#.])${escaped}(?![A-Za-z0-9+#.])`, "i")
      : new RegExp(`\\b${escaped}\\b`, "i");
    if (pattern.test(lower)) found.add(canonical(skill));
  }
  return [...found].sort();
}

function extractExperienceYears(text: string): number {
  const explicit: number[] = [];
  let m: RegExpExecArray | null;
  const yr = new RegExp(YEARS_RE.source, "gi");
  while ((m = yr.exec(text)) !== null) explicit.push(parseInt(m[1]));
  if (explicit.length) return Math.max(...explicit);

  const currentYear = new Date().getFullYear();
  let total = 0;
  const dr = new RegExp(DATE_RANGE_RE.source, "gi");
  while ((m = dr.exec(text)) !== null) {
    const start = parseInt(m[1]);
    const endRaw = (m[2] ?? "").toLowerCase();
    const end = endRaw === "present" || endRaw === "current" ? currentYear : parseInt(endRaw);
    if (end >= start) total += end - start;
  }
  return total;
}

function extractEducation(text: string): string[] {
  const kwRe = new RegExp(`(?<![A-Za-z0-9])(?:${EDUCATION_KW.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(?![A-Za-z0-9])`, "i");
  const found: string[] = [];
  const seen = new Set<string>();
  for (const line of text.split("\n")) {
    const l = line.trim();
    if (l && !seen.has(l) && kwRe.test(l)) { found.push(l); seen.add(l); }
    if (found.length >= 10) break;
  }
  return found;
}

// ── Scoring ──────────────────────────────────────────────────────────────────

const W_SKILL = 0.4, W_EXP = 0.3, W_SEM = 0.3;
const STRONG_FIT = 75, MODERATE = 50;

export interface FitScore {
  fit_score: number;
  skill_match: number;
  experience_match: number;
  semantic_similarity: number;
  missing_skills: string[];
  matched_skills: string[];
  required_experience_years: number;
  candidate_experience_years: number;
  recommendation: string;
}

export function scoreResume(resume: ParsedResume, jobDescription: string): FitScore {
  if (!jobDescription.trim()) throw new Error("Job description must not be empty.");

  const jdSkills = extractJdSkills(jobDescription);
  const requiredYears = extractRequiredExperience(jobDescription);

  const candidateSet = new Set(resume.skills.map(canonical));
  const jdSet = new Set(jdSkills.map(canonical));
  const matched = [...candidateSet].filter(s => jdSet.has(s));
  const missing = [...jdSet].filter(s => !candidateSet.has(s)).sort();
  const skill_match = jdSet.size > 0 ? (matched.length / jdSet.size) * 100 : 0;

  const candidateYears = resume.experience_years ?? 0;
  const experience_match = requiredYears <= 0 ? 100 : Math.min((candidateYears / requiredYears) * 100, 100);

  // Lightweight semantic similarity: Jaccard on word tokens (no heavy ML model needed)
  const semantic_similarity = jaccardSimilarity(resume.raw_text ?? "", jobDescription);

  const fit_score = Math.round((W_SKILL * skill_match + W_EXP * experience_match + W_SEM * semantic_similarity) * 100) / 100;

  return {
    fit_score,
    skill_match: Math.round(skill_match * 100) / 100,
    experience_match: Math.round(experience_match * 100) / 100,
    semantic_similarity: Math.round(semantic_similarity * 100) / 100,
    missing_skills: missing,
    matched_skills: matched.sort(),
    required_experience_years: requiredYears,
    candidate_experience_years: candidateYears,
    recommendation: fit_score >= STRONG_FIT ? "Strong Fit" : fit_score >= MODERATE ? "Moderate" : "Reject",
  };
}

function extractJdSkills(jd: string): string[] {
  const found = new Set<string>();
  const lower = jd.toLowerCase();
  for (const skill of SKILLS_VOCAB) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const hasSpecial = /[.+#]/.test(skill);
    const pattern = hasSpecial
      ? new RegExp(`(?<![A-Za-z0-9+#.])${escaped}(?![A-Za-z0-9+#.])`, "i")
      : new RegExp(`\\b${escaped}\\b`, "i");
    if (pattern.test(lower)) found.add(canonical(skill));
  }
  return [...found].sort();
}

function extractRequiredExperience(jd: string): number {
  const patterns = [
    /(\d{1,2})\s*\+\s*(?:years?|yrs?)/i,
    /minimum\s+(?:of\s+)?(\d{1,2})\s*(?:years?|yrs?)/i,
    /at\s+least\s+(\d{1,2})\s*(?:years?|yrs?)/i,
    /(\d{1,2})\s*[-–]\s*\d{1,2}\s*(?:years?|yrs?)/i,
    /(\d{1,2})\s*(?:years?|yrs?)\s*(?:of)?\s*experience/i,
  ];
  for (const p of patterns) {
    const m = jd.match(p);
    if (m) return parseFloat(m[1]);
  }
  return 0;
}

function jaccardSimilarity(a: string, b: string): number {
  const tokenize = (s: string) => new Set(s.toLowerCase().match(/\b\w{3,}\b/g) ?? []);
  const setA = tokenize(a);
  const setB = tokenize(b);
  const intersection = [...setA].filter(t => setB.has(t)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : Math.round((intersection / union) * 10000) / 100;
}
