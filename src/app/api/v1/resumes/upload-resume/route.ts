/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest } from "next/server";
import { authenticateRecruiter, unauthorized, forbidden } from "@/lib/apiHelpers";
import { extractText, parseResumeText } from "@/lib/resumeEngine";
import { supabase } from "@/lib/db";

const MAX_MB = 10;

export async function POST(req: NextRequest) {
  const userId = await authenticateRecruiter(req);
  if (userId === null) return unauthorized();
  if (userId === -1) return forbidden("Recruiter access required.");

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return Response.json({ success: false, error: "No file provided." }, { status: 400 });

  const name = file.name.toLowerCase();
  if (!name.endsWith(".pdf") && !name.endsWith(".docx")) {
    return Response.json({ success: false, error: "Only PDF and DOCX files are supported." }, { status: 415 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  if (buffer.byteLength > MAX_MB * 1024 * 1024) {
    return Response.json({ success: false, error: `File too large. Max ${MAX_MB} MB.` }, { status: 413 });
  }

  let text: string;
  try {
    text = await extractText(file.name, buffer);
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 422 });
  }

  if (!text) return Response.json({ success: false, error: "No text could be extracted from the file." }, { status: 422 });

  const parsed = parseResumeText(file.name, text);

  // Persist to DB
  try {
    await supabase.from("resumes").insert({
      filename: parsed.filename,
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone,
      experience_years: parsed.experience_years,
      skills: parsed.skills,
      education: parsed.education,
      raw_text: parsed.raw_text,
    });
  } catch { /* non-fatal */ }

  return Response.json({ success: true, data: parsed });
}
