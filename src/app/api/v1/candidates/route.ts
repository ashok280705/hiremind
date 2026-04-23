/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest } from "next/server";
import { supabase } from "@/lib/db";
import { authenticateRecruiter, unauthorized, forbidden } from "@/lib/apiHelpers";

export async function GET(req: NextRequest) {
  const userId = await authenticateRecruiter(req);
  if (userId === null) return unauthorized();
  if (userId === -1) return forbidden("Recruiter access required.");

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const job_id = searchParams.get("job_id");

  let query = supabase.from("candidates").select("*").order("fit_score", { ascending: false });
  if (status) query = query.eq("status", status);
  if (job_id) query = query.eq("job_id", job_id);

  const { data: candidates } = await query;
  const data = (candidates || []).map((c: any) => ({ ...c, bias_flag: !!c.bias_flag }));
  return Response.json({ success: true, total: data.length, data });
}

export async function POST(req: NextRequest) {
  const userId = await authenticateRecruiter(req);
  if (userId === null) return unauthorized();
  if (userId === -1) return forbidden("Recruiter access required.");

  const { name, email, role, experience = null, skills = [], job_id = null } = await req.json();

  const { data: candidate } = await supabase
    .from("candidates")
    .insert({ name, email, role, experience, skills, job_id })
    .select()
    .single();

  return Response.json(candidate, { status: 201 });
}
