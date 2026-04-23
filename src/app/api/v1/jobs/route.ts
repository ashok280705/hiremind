/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest } from "next/server";
import { supabase } from "@/lib/db";
import { authenticateRecruiter, unauthorized, forbidden } from "@/lib/apiHelpers";

async function jobOut(job: any) {
  const { count: applicants } = await supabase
    .from("candidates")
    .select("*", { count: "exact", head: true })
    .eq("job_id", job.id);

  const { data: rows } = await supabase
    .from("candidates")
    .select("fit_score")
    .eq("job_id", job.id)
    .gt("fit_score", 0);

  const scores = rows || [];
  const avg_score = scores.length
    ? Math.round(scores.reduce((s: number, r: any) => s + r.fit_score, 0) / scores.length * 10) / 10
    : 0;

  return { ...job, applicants: applicants || 0, avg_score };
}

export async function GET(req: NextRequest) {
  const userId = await authenticateRecruiter(req);
  if (userId === null) return unauthorized();
  if (userId === -1) return forbidden("Recruiter access required.");

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .order("posted_date", { ascending: false });

  const data = await Promise.all((jobs || []).map((j: any) => jobOut(j)));
  return Response.json({ success: true, total: data.length, data });
}

export async function POST(req: NextRequest) {
  const userId = await authenticateRecruiter(req);
  if (userId === null) return unauthorized();
  if (userId === -1) return forbidden("Recruiter access required.");

  const { title, department, location, type = "full-time", status = "active", description = null, skills = [] } = await req.json();

  const { data: job } = await supabase
    .from("jobs")
    .insert({ title, department, location, type, status, description, skills, created_by: userId })
    .select()
    .single();

  return Response.json(await jobOut(job), { status: 201 });
}
