/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest } from "next/server";
import { supabase } from "@/lib/db";
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
  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .eq("status", "active")
    .single();
  if (!job) return Response.json({ success: false, error: "Job not found or no longer open." }, { status: 404 });

  // Prevent duplicate applications to the same job by the same user
  const { data: existing } = await supabase
    .from("candidates")
    .select("id")
    .eq("user_id", auth.userId)
    .eq("job_id", jobId)
    .single();
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
  const jobSkills = Array.isArray(job.skills) ? job.skills : JSON.parse(job.skills || "[]");
  const jdText = [job.title, job.description || "", "Required skills: " + (jobSkills as string[]).join(", ")].join("\n");
  const score = scoreResume(parsed, jdText.length >= 10 ? jdText : jdText.padEnd(10, " "));

  // Pull the candidate's user account for name/email defaults
  const { data: account, error: accountError } = await supabase
    .from("users")
    .select("name, email")
    .eq("id", auth.userId)
    .single();

  if (accountError || !account) {
    return Response.json({ success: false, error: "User account not found." }, { status: 404 });
  }
  const finalName = account.name;
  const finalEmail = account.email;

  try {
    await supabase.from("resumes").insert({
      filename: parsed.filename,
      name: finalName,
      email: finalEmail,
      phone: parsed.phone,
      experience_years: parsed.experience_years,
      skills: parsed.skills,
      education: parsed.education,
      raw_text: parsed.raw_text,
    });
  } catch { /* non-fatal */ }

  const { data: candidate } = await supabase
    .from("candidates")
    .insert({
      name: finalName,
      email: finalEmail,
      role: job.title,
      experience: parsed.experience_years ? `${parsed.experience_years} years` : null,
      skills: parsed.skills,
      status: "new",
      fit_score: score.fit_score,
      resume_score: Math.round(score.skill_match * 100) / 100,
      bias_flag: false,
      diversity_score: Math.round(((score.semantic_similarity + score.skill_match) / 2) * 100) / 100,
      success_prediction: Math.round(score.fit_score * 0.95 * 100) / 100,
      job_id: jobId,
      user_id: auth.userId,
      resume_filename: parsed.filename,
    })
    .select("id")
    .single();

  return Response.json({
    success: true,
    candidate_id: candidate?.id,
    job: { id: job.id, title: job.title },
    fit_score: score.fit_score,
    recommendation: score.recommendation,
    matched_skills: score.matched_skills,
    missing_skills: score.missing_skills,
  });
}
