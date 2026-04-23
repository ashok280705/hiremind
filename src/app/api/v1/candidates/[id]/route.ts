/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest } from "next/server";
import { supabase } from "@/lib/db";
import { authenticateRecruiter, unauthorized, forbidden, notFound } from "@/lib/apiHelpers";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await authenticateRecruiter(req);
  if (userId === null) return unauthorized();
  if (userId === -1) return forbidden("Recruiter access required.");
  const { id } = await params;

  const { data: candidate } = await supabase.from("candidates").select("*").eq("id", id).single();
  if (!candidate) return notFound("Candidate not found.");
  return Response.json({ ...candidate, bias_flag: !!candidate.bias_flag });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await authenticateRecruiter(req);
  if (userId === null) return unauthorized();
  if (userId === -1) return forbidden("Recruiter access required.");
  const { id } = await params;

  const { data: existing } = await supabase.from("candidates").select("id").eq("id", id).single();
  if (!existing) return notFound("Candidate not found.");

  const body = await req.json();
  const updates: Record<string, unknown> = {};
  if (typeof body.bias_flag === "boolean") updates.bias_flag = body.bias_flag;
  if (typeof body.experience === "string") updates.experience = body.experience;
  if (Array.isArray(body.skills)) updates.skills = body.skills;
  if (!Object.keys(updates).length) return Response.json({ success: false, error: "No valid fields to update." }, { status: 400 });

  const { data: candidate } = await supabase
    .from("candidates")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();
  return Response.json({ ...candidate, bias_flag: !!candidate!.bias_flag });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await authenticateRecruiter(req);
  if (userId === null) return unauthorized();
  if (userId === -1) return forbidden("Recruiter access required.");
  const { id } = await params;

  const { data: existing } = await supabase.from("candidates").select("id").eq("id", id).single();
  if (!existing) return notFound("Candidate not found.");

  await supabase.from("candidates").delete().eq("id", id);
  return new Response(null, { status: 204 });
}
