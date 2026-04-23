/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { authenticateRecruiter, unauthorized, forbidden } from "@/lib/apiHelpers";

function jobOut(job: any, db: any) {
  const applicants = (db.prepare("SELECT COUNT(*) as c FROM candidates WHERE job_id = ?").get(job.id) as any).c;
  const rows = db.prepare("SELECT fit_score FROM candidates WHERE job_id = ? AND fit_score > 0").all(job.id) as any[];
  const avg_score = rows.length ? Math.round(rows.reduce((s: number, r: any) => s + r.fit_score, 0) / rows.length * 10) / 10 : 0;
  return { ...job, skills: JSON.parse(job.skills || "[]"), applicants, avg_score };
}

export async function GET(req: NextRequest) {
  const userId = await authenticateRecruiter(req);
  if (userId === null) return unauthorized();
  if (userId === -1) return forbidden("Recruiter access required.");

  const db = getDb();
  const jobs = db.prepare("SELECT * FROM jobs ORDER BY posted_date DESC").all();
  const data = jobs.map((j: any) => jobOut(j, db));
  return Response.json({ success: true, total: data.length, data });
}

export async function POST(req: NextRequest) {
  const userId = await authenticateRecruiter(req);
  if (userId === null) return unauthorized();
  if (userId === -1) return forbidden("Recruiter access required.");

  const { title, department, location, type = "full-time", status = "active", description = null, skills = [] } = await req.json();
  const db = getDb();
  const result = db.prepare(
    "INSERT INTO jobs (title, department, location, type, status, description, skills, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(title, department, location, type, status, description, JSON.stringify(skills), userId);

  const job = db.prepare("SELECT * FROM jobs WHERE id = ?").get(result.lastInsertRowid);
  return Response.json(jobOut(job, db), { status: 201 });
}
