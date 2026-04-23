/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { authenticateRecruiter, unauthorized, forbidden, notFound } from "@/lib/apiHelpers";

function interviewOut(iv: any, db: any) {
  const candidate = db.prepare("SELECT name FROM candidates WHERE id = ?").get(iv.candidate_id) as any;
  const name = candidate?.name || "";
  const candidate_avatar = name.split(" ").map((p: string) => p[0]).join("").toUpperCase().slice(0, 2) || "?";
  return { ...iv, candidate_name: name, candidate_avatar };
}

export async function GET(req: NextRequest) {
  const userId = await authenticateRecruiter(req);
  if (userId === null) return unauthorized();
  if (userId === -1) return forbidden("Recruiter access required.");

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const db = getDb();
  let query = "SELECT * FROM interviews WHERE 1=1";
  const args: any[] = [];
  if (status) { query += " AND status = ?"; args.push(status); }
  query += " ORDER BY date ASC";

  const interviews = db.prepare(query).all(...args);
  const data = interviews.map((iv: any) => interviewOut(iv, db));
  return Response.json({ success: true, total: data.length, data });
}

export async function POST(req: NextRequest) {
  const userId = await authenticateRecruiter(req);
  if (userId === null) return unauthorized();
  if (userId === -1) return forbidden("Recruiter access required.");

  const { candidate_id, role, date, time, type, interviewer } = await req.json();
  const db = getDb();
  if (!db.prepare("SELECT id FROM candidates WHERE id = ?").get(candidate_id)) {
    return notFound("Candidate not found.");
  }
  const result = db.prepare(
    "INSERT INTO interviews (candidate_id, role, date, time, type, interviewer) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(candidate_id, role, date, time, type, interviewer);

  const iv = db.prepare("SELECT * FROM interviews WHERE id = ?").get(result.lastInsertRowid);
  return Response.json(interviewOut(iv, db), { status: 201 });
}
