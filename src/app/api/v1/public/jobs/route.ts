/* eslint-disable @typescript-eslint/no-explicit-any */

import { supabase } from "@/lib/db";

export async function GET() {
  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title, department, location, type, description, skills, posted_date")
    .eq("status", "active")
    .order("posted_date", { ascending: false });

  const data = (jobs || []).map((j: any) => ({ ...j }));
  return Response.json({ success: true, total: data.length, data });
}
