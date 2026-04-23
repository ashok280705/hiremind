/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest } from "next/server";
import { authenticateRecruiter, unauthorized, forbidden } from "@/lib/apiHelpers";
import { extractText, parseResumeText } from "@/lib/resumeEngine";
import { getDb } from "@/lib/db";

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
    const db = getDb();
    db.prepare(`
      INSERT INTO resumes (filename, name, email, phone, experience_years, skills, education, raw_text)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      parsed.filename, parsed.name, parsed.email, parsed.phone,
      parsed.experience_years, JSON.stringify(parsed.skills),
      JSON.stringify(parsed.education), parsed.raw_text
    );
  } catch { /* non-fatal */ }

  return Response.json({ success: true, data: parsed });
}
