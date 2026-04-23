/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest } from "next/server";
import { supabase } from "@/lib/db";
import { authenticateRecruiter, unauthorized, forbidden } from "@/lib/apiHelpers";

export async function GET(req: NextRequest) {
  const userId = await authenticateRecruiter(req);
  if (userId === null) return unauthorized();
  if (userId === -1) return forbidden("Recruiter access required.");

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { count: active_jobs } = await supabase
    .from("jobs")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  const { count: total_candidates } = await supabase
    .from("candidates")
    .select("*", { count: "exact", head: true });

  const { count: scheduled_interviews } = await supabase
    .from("interviews")
    .select("*", { count: "exact", head: true })
    .eq("status", "scheduled");

  const { count: hires_this_month } = await supabase
    .from("candidates")
    .select("*", { count: "exact", head: true })
    .eq("status", "hired")
    .gte("applied_date", monthStart);

  return Response.json({
    active_jobs: active_jobs || 0,
    total_candidates: total_candidates || 0,
    scheduled_interviews: scheduled_interviews || 0,
    hires_this_month: hires_this_month || 0,
  });
}
