/* eslint-disable @typescript-eslint/no-explicit-any */

import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
  const jobs = db.prepare(
    "SELECT id, title, department, location, type, description, skills, posted_date FROM jobs WHERE status = 'active' ORDER BY posted_date DESC"
  ).all();
  const data = jobs.map((j: any) => ({ ...j, skills: JSON.parse(j.skills || "[]") }));
  return Response.json({ success: true, total: data.length, data });
}
