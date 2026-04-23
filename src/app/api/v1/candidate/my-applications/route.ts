/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest } from "next/server";
import { supabase } from "@/lib/db";
import { authenticateWithRole, unauthorized, forbidden } from "@/lib/apiHelpers";

export async function GET(req: NextRequest) {
  const auth = await authenticateWithRole(req);
  if (!auth) return unauthorized();
  if (auth.role !== "candidate") return forbidden("Only candidates can view their applications.");

  // Fetch candidates belonging to this user
  const { data: rows } = await supabase
    .from("candidates")
    .select("id, name, email, role, status, fit_score, resume_score, skills, applied_date, resume_filename, job_id")
    .eq("user_id", auth.userId)
    .order("applied_date", { ascending: false });

  const data = await Promise.all((rows || []).map(async (r: any) => {
    // Fetch job details if linked
    let job = null;
    if (r.job_id) {
      const { data: j } = await supabase
        .from("jobs")
        .select("id, title, department, location, type, status")
        .eq("id", r.job_id)
        .single();
      if (j) {
        job = { id: j.id, title: j.title, department: j.department, location: j.location, type: j.type, status: j.status };
      }
    }

    // Find the most recent interview for this application, if any
    const { data: iv } = await supabase
      .from("interviews")
      .select("id, date, time, type, status, rating")
      .eq("candidate_id", r.id)
      .order("date", { ascending: false })
      .limit(1)
      .single();

    return {
      id: r.id,
      applied_date: r.applied_date,
      status: r.status,
      fit_score: r.fit_score,
      resume_score: r.resume_score,
      skills: r.skills,
      resume_filename: r.resume_filename,
      job,
      interview: iv || null,
    };
  }));

  return Response.json({ success: true, total: data.length, data });
}
