import { NextRequest } from "next/server";
import { supabase } from "@/lib/db";
import { authenticate, unauthorized, badRequest } from "@/lib/apiHelpers";

export async function GET(req: NextRequest) {
  const userId = await authenticate(req);
  if (!userId) return unauthorized();

  const { data: user } = await supabase
    .from("users")
    .select("id, name, email, role, created_at")
    .eq("id", userId)
    .single();
  return Response.json(user);
}

export async function PATCH(req: NextRequest) {
  const userId = await authenticate(req);
  if (!userId) return unauthorized();

  const { name, email } = await req.json();

  const updates: Record<string, unknown> = {};
  if (typeof name === "string" && name.trim()) {
    updates.name = name.trim();
  }
  if (typeof email === "string" && email.trim()) {
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.trim())
      .neq("id", userId)
      .single();
    if (existing) return badRequest("Email is already in use by another account.");
    updates.email = email.trim();
  }
  if (!Object.keys(updates).length) return badRequest("No fields to update.");

  const { data: user } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select("id, name, email, role, created_at")
    .single();
  return Response.json(user);
}
