/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest } from "next/server";
import { supabase } from "@/lib/db";
import { authenticateRecruiter, unauthorized, forbidden, notFound } from "@/lib/apiHelpers";

async function interviewOut(iv: any) {
  const { data: candidate } = await supabase
    .from("candidates")
    .select("name")
    .eq("id", iv.candidate_id)
    .single();

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

  let query = supabase.from("interviews").select("*").order("date", { ascending: true });
  if (status) query = query.eq("status", status);

  const { data: interviews } = await query;
  const data = await Promise.all((interviews || []).map((iv: any) => interviewOut(iv)));
  return Response.json({ success: true, total: data.length, data });
}

export async function POST(req: NextRequest) {
  const userId = await authenticateRecruiter(req);
  if (userId === null) return unauthorized();
  if (userId === -1) return forbidden("Recruiter access required.");

  const { candidate_id, role, date, time, type, interviewer } = await req.json();

  const { data: cand } = await supabase.from("candidates").select("id").eq("id", candidate_id).single();
  if (!cand) return notFound("Candidate not found.");

  const { data: iv } = await supabase
    .from("interviews")
    .insert({ candidate_id, role, date, time, type, interviewer })
    .select()
    .single();

  return Response.json(await interviewOut(iv), { status: 201 });
}
