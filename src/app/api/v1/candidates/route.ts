/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { authenticateRecruiter, unauthorized, forbidden } from "@/lib/apiHelpers";

function candidateOut(c: any) {
  return { ...c, skills: JSON.parse(c.skills || "[]"), bias_flag: !!c.bias_flag };
}

export async function GET(req: NextRequest) {
  const userId = await authenticateRecruiter(req);
  if (userId === null) return unauthorized();
  if (userId === -1) return forbidden("Recruiter access required.");

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const job_id = searchParams.get("job_id");

  const db = getDb();
  let query = "SELECT * FROM candidates WHERE 1=1";
  const args: any[] = [];
  if (status) { query += " AND status = ?"; args.push(status); }
  if (job_id) { query += " AND job_id = ?"; args.push(job_id); }
  query += " ORDER BY fit_score DESC";

  const candidates = db.prepare(query).all(...args);
  const data = candidates.map(candidateOut);
  return Response.json({ success: true, total: data.length, data });
}

export async function POST(req: NextRequest) {
  const userId = await authenticateRecruiter(req);
  if (userId === null) return unauthorized();
  if (userId === -1) return forbidden("Recruiter access required.");

  const { name, email, role, experience = null, skills = [], job_id = null } = await req.json();
  const db = getDb();
  const result = db.prepare(
    "INSERT INTO candidates (name, email, role, experience, skills, job_id) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(name, email, role, experience, JSON.stringify(skills), job_id);

  const candidate = db.prepare("SELECT * FROM candidates WHERE id = ?").get(result.lastInsertRowid);
  return Response.json(candidateOut(candidate), { status: 201 });
}
