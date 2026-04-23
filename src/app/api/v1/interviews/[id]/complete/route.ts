/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest } from "next/server";
import { supabase } from "@/lib/db";
import { authenticateRecruiter, unauthorized, forbidden, notFound } from "@/lib/apiHelpers";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await authenticateRecruiter(req);
  if (userId === null) return unauthorized();
  if (userId === -1) return forbidden("Recruiter access required.");
  const { id } = await params;
  const { rating, ai_insight = null } = await req.json();

  const { data: existing } = await supabase.from("interviews").select("id").eq("id", id).single();
  if (!existing) return notFound("Interview not found.");

  await supabase
    .from("interviews")
    .update({ status: "completed", rating, ai_insight })
    .eq("id", id);

  const { data: iv } = await supabase.from("interviews").select("*").eq("id", id).single();
  const { data: candidate } = await supabase
    .from("candidates")
    .select("name")
    .eq("id", iv.candidate_id)
    .single();

  const name = candidate?.name || "";
  const candidate_avatar = name.split(" ").map((p: string) => p[0]).join("").toUpperCase().slice(0, 2) || "?";
  return Response.json({ ...iv, candidate_name: name, candidate_avatar });
}
