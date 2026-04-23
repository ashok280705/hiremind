/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { authenticateRecruiter, unauthorized, forbidden, notFound } from "@/lib/apiHelpers";

function jobOut(job: any, db: any) {
  const applicants = (db.prepare("SELECT COUNT(*) as c FROM candidates WHERE job_id = ?").get(job.id) as any).c;
  const rows = db.prepare("SELECT fit_score FROM candidates WHERE job_id = ? AND fit_score > 0").all(job.id) as any[];
  const avg_score = rows.length ? Math.round(rows.reduce((s: number, r: any) => s + r.fit_score, 0) / rows.length * 10) / 10 : 0;
  return { ...job, skills: JSON.parse(job.skills || "[]"), applicants, avg_score };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await authenticateRecruiter(req);
  if (userId === null) return unauthorized();
  if (userId === -1) return forbidden("Recruiter access required.");
  const { id } = await params;
  const db = getDb();
  const job = db.prepare("SELECT * FROM jobs WHERE id = ?").get(id);
  if (!job) return notFound("Job not found.");
  return Response.json(jobOut(job, db));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await authenticateRecruiter(req);
  if (userId === null) return unauthorized();
  if (userId === -1) return forbidden("Recruiter access required.");
  const { id } = await params;
  const db = getDb();
  const job = db.prepare("SELECT * FROM jobs WHERE id = ?").get(id) as any;
  if (!job) return notFound("Job not found.");

  const body = await req.json();
  const fields = ["title", "department", "location", "type", "status", "description", "skills"];
  const updates: string[] = [];
  const values: any[] = [];
  for (const f of fields) {
    if (body[f] !== undefined) {
      updates.push(`${f} = ?`);
      values.push(f === "skills" ? JSON.stringify(body[f]) : body[f]);
    }
  }
  if (updates.length) {
    values.push(id);
    db.prepare(`UPDATE jobs SET ${updates.join(", ")} WHERE id = ?`).run(...values);
  }
  const updated = db.prepare("SELECT * FROM jobs WHERE id = ?").get(id);
  return Response.json(jobOut(updated, db));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await authenticateRecruiter(req);
  if (userId === null) return unauthorized();
  if (userId === -1) return forbidden("Recruiter access required.");
  const { id } = await params;
  const db = getDb();
  const job = db.prepare("SELECT id FROM jobs WHERE id = ?").get(id);
  if (!job) return notFound("Job not found.");
  db.prepare("DELETE FROM jobs WHERE id = ?").run(id);
  return new Response(null, { status: 204 });
}
