/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { authenticateWithRole, unauthorized, forbidden } from "@/lib/apiHelpers";
import { extractText, parseResumeText, scoreResume } from "@/lib/resumeEngine";

const MAX_MB = 10;

export async function POST(req: NextRequest) {
  const auth = await authenticateWithRole(req);
  if (!auth) return unauthorized();
  if (auth.role !== "candidate") return forbidden("Only candidates can apply for jobs.");

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const jobIdRaw = form.get("job_id") as string | null;
  if (!file) return Response.json({ success: false, error: "Resume file is required." }, { status: 400 });
  if (!jobIdRaw) return Response.json({ success: false, error: "Job selection is required." }, { status: 400 });

  const jobId = Number(jobIdRaw);
  const db = getDb();
  const job = db.prepare("SELECT * FROM jobs WHERE id = ? AND status = 'active'").get(jobId) as any;
  if (!job) return Response.json({ success: false, error: "Job not found or no longer open." }, { status: 404 });

  // Prevent duplicate applications to the same job by the same user
  const existing = db.prepare("SELECT id FROM candidates WHERE user_id = ? AND job_id = ?").get(auth.userId, jobId);
  if (existing) {
    return Response.json({ success: false, error: "You have already applied to this job." }, { status: 409 });
  }

  const fname = file.name.toLowerCase();
  if (!fname.endsWith(".pdf") && !fname.endsWith(".docx")) {
    return Response.json({ success: false, error: "Only PDF and DOCX files are supported." }, { status: 415 });
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.byteLength > MAX_MB * 1024 * 1024) {
    return Response.json({ success: false, error: `File too large. Max ${MAX_MB} MB.` }, { status: 413 });
  }

  let text: string;
  try { text = await extractText(file.name, buffer); }
  catch (e: any) { return Response.json({ success: false, error: e.message }, { status: 422 }); }
  if (!text) return Response.json({ success: false, error: "No text could be extracted from the resume." }, { status: 422 });

  const parsed = parseResumeText(file.name, text);
  const jdText = [job.title, job.description || "", "Required skills: " + (JSON.parse(job.skills || "[]") as string[]).join(", ")].join("\n");
  const score = scoreResume(parsed, jdText.length >= 10 ? jdText : jdText.padEnd(10, " "));

  // Pull the candidate's user account for name/email defaults
  const account = db.prepare("SELECT name, email FROM users WHERE id = ?").get(auth.userId) as { name: string; email: string };
  const finalName = account.name;
  const finalEmail = account.email;

  try {
    db.prepare(`
      INSERT INTO resumes (filename, name, email, phone, experience_years, skills, education, raw_text)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      parsed.filename, finalName, finalEmail, parsed.phone,
      parsed.experience_years, JSON.stringify(parsed.skills),
      JSON.stringify(parsed.education), parsed.raw_text
    );
  } catch { /* non-fatal */ }

  const result = db.prepare(`
    INSERT INTO candidates (name, email, role, experience, skills, status, fit_score, resume_score, bias_flag, diversity_score, success_prediction, job_id, user_id, resume_filename)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    finalName, finalEmail, job.title,
    parsed.experience_years ? `${parsed.experience_years} years` : null,
    JSON.stringify(parsed.skills),
    "new",
    score.fit_score,
    Math.round(score.skill_match * 100) / 100,
    0,
    Math.round(((score.semantic_similarity + score.skill_match) / 2) * 100) / 100,
    Math.round(score.fit_score * 0.95 * 100) / 100,
    jobId,
    auth.userId,
    parsed.filename,
  );

  return Response.json({
    success: true,
    candidate_id: result.lastInsertRowid,
    job: { id: job.id, title: job.title },
    fit_score: score.fit_score,
    recommendation: score.recommendation,
    matched_skills: score.matched_skills,
    missing_skills: score.missing_skills,
  });
}
