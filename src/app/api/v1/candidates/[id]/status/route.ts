/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest } from "next/server";
import { supabase } from "@/lib/db";
import { authenticateRecruiter, unauthorized, forbidden, notFound, badRequest } from "@/lib/apiHelpers";

const VALID = new Set(["new", "screening", "interview", "offer", "hired", "rejected"]);

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await authenticateRecruiter(req);
  if (userId === null) return unauthorized();
  if (userId === -1) return forbidden("Recruiter access required.");
  const { id } = await params;
  const { status } = await req.json();
  if (!VALID.has(status)) return badRequest(`Invalid status. Must be one of: ${[...VALID].join(", ")}`);

  const { data: existing } = await supabase.from("candidates").select("id").eq("id", id).single();
  if (!existing) return notFound("Candidate not found.");

  const { data: candidate } = await supabase
    .from("candidates")
    .update({ status })
    .eq("id", id)
    .select("*")
    .single();

  return Response.json({ ...candidate, bias_flag: !!candidate!.bias_flag });
}
