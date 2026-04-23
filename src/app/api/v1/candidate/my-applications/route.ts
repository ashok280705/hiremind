/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { authenticateWithRole, unauthorized, forbidden } from "@/lib/apiHelpers";

export async function GET(req: NextRequest) {
  const auth = await authenticateWithRole(req);
  if (!auth) return unauthorized();
  if (auth.role !== "candidate") return forbidden("Only candidates can view their applications.");

  const db = getDb();
  const rows = db.prepare(`
    SELECT c.id, c.name, c.email, c.role, c.status, c.fit_score, c.resume_score,
           c.skills, c.applied_date, c.resume_filename,
           j.id AS job_id, j.title AS job_title, j.department, j.location, j.type, j.status AS job_status
    FROM candidates c
    LEFT JOIN jobs j ON j.id = c.job_id
    WHERE c.user_id = ?
    ORDER BY c.applied_date DESC
  `).all(auth.userId) as any[];

  const data = rows.map((r) => {
    // Find the most recent interview for this application, if any
    const iv = db.prepare("SELECT id, date, time, type, status, rating FROM interviews WHERE candidate_id = ? ORDER BY date DESC LIMIT 1").get(r.id) as any;
    return {
      id: r.id,
      applied_date: r.applied_date,
      status: r.status,
      fit_score: r.fit_score,
      resume_score: r.resume_score,
      skills: JSON.parse(r.skills || "[]"),
      resume_filename: r.resume_filename,
      job: r.job_id ? {
        id: r.job_id, title: r.job_title, department: r.department,
        location: r.location, type: r.type, status: r.job_status,
      } : null,
      interview: iv || null,
    };
  });

  return Response.json({ success: true, total: data.length, data });
}
