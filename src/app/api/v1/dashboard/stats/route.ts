/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { authenticateRecruiter, unauthorized, forbidden } from "@/lib/apiHelpers";

export async function GET(req: NextRequest) {
  const userId = await authenticateRecruiter(req);
  if (userId === null) return unauthorized();
  if (userId === -1) return forbidden("Recruiter access required.");

  const db = getDb();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const active_jobs = (db.prepare("SELECT COUNT(*) as c FROM jobs WHERE status = 'active'").get() as any).c;
  const total_candidates = (db.prepare("SELECT COUNT(*) as c FROM candidates").get() as any).c;
  const scheduled_interviews = (db.prepare("SELECT COUNT(*) as c FROM interviews WHERE status = 'scheduled'").get() as any).c;
  const hires_this_month = (db.prepare(
    "SELECT COUNT(*) as c FROM candidates WHERE status = 'hired' AND applied_date >= ?"
  ).get(monthStart) as any).c;

  return Response.json({ active_jobs, total_candidates, scheduled_interviews, hires_this_month });
}
