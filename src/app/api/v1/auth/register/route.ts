import { NextRequest } from "next/server";
import { supabase } from "@/lib/db";
import { hashPassword, createToken } from "@/lib/auth";
import { badRequest } from "@/lib/apiHelpers";

export async function POST(req: NextRequest) {
  const { name, email, password, role } = await req.json();
  if (!name || !email || !password) return badRequest("name, email and password are required.");

  const normalizedRole = role === "candidate" ? "candidate" : "recruiter";

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();
  if (existing) {
    return badRequest("Email already registered.");
  }

  const hashed = await hashPassword(password);
  const { data: user, error: insertError } = await supabase
    .from("users")
    .insert({ name, email, hashed_password: hashed, role: normalizedRole })
    .select("id, name, email, role, created_at")
    .single();

  if (insertError) {
    console.error("Registration insert error:", insertError);
    return Response.json({ success: false, error: "Failed to create user account." }, { status: 500 });
  }

  if (!user) {
    return Response.json({ success: false, error: "User creation failed unexpectedly." }, { status: 500 });
  }

  const token = await createToken(user.id);
  return Response.json({ access_token: token, token_type: "bearer", user }, { status: 201 });
}
