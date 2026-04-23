import { NextRequest } from "next/server";
import { supabase } from "@/lib/db";
import { authenticateRecruiter, unauthorized, forbidden, notFound } from "@/lib/apiHelpers";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await authenticateRecruiter(req);
  if (userId === null) return unauthorized();
  if (userId === -1) return forbidden("Recruiter access required.");
  const { id } = await params;

  const { data } = await supabase.from("interviews").select("id").eq("id", id).single();
  if (!data) return notFound("Interview not found.");

  await supabase.from("interviews").delete().eq("id", id);
  return new Response(null, { status: 204 });
}
