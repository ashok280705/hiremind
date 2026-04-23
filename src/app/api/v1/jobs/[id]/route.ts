/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest } from "next/server";
import { supabase } from "@/lib/db";
import { authenticateRecruiter, unauthorized, forbidden, notFound } from "@/lib/apiHelpers";

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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await authenticateRecruiter(req);
  if (userId === null) return unauthorized();
  if (userId === -1) return forbidden("Recruiter access required.");
  const { id } = await params;

  const { data: job } = await supabase.from("jobs").select("*").eq("id", id).single();
  if (!job) return notFound("Job not found.");
  return Response.json(await jobOut(job));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await authenticateRecruiter(req);
  if (userId === null) return unauthorized();
  if (userId === -1) return forbidden("Recruiter access required.");
  const { id } = await params;

  const { data: job } = await supabase.from("jobs").select("*").eq("id", id).single();
  if (!job) return notFound("Job not found.");

  const body = await req.json();
  const fields = ["title", "department", "location", "type", "status", "description", "skills"];
  const updates: Record<string, unknown> = {};
  for (const f of fields) {
    if (body[f] !== undefined) {
      updates[f] = body[f];
    }
  }

  if (Object.keys(updates).length) {
    await supabase.from("jobs").update(updates).eq("id", id);
  }

  const { data: updated } = await supabase.from("jobs").select("*").eq("id", id).single();
  return Response.json(await jobOut(updated));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await authenticateRecruiter(req);
  if (userId === null) return unauthorized();
  if (userId === -1) return forbidden("Recruiter access required.");
  const { id } = await params;

  const { data: job } = await supabase.from("jobs").select("id").eq("id", id).single();
  if (!job) return notFound("Job not found.");

  await supabase.from("jobs").delete().eq("id", id);
  return new Response(null, { status: 204 });
}
