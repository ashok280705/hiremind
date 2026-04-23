/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest } from "next/server";
import { supabase } from "@/lib/db";
import { verifyPassword, createToken } from "@/lib/auth";
import { badRequest } from "@/lib/apiHelpers";

export async function POST(req: NextRequest) {
  const { email, password, role } = await req.json();
  if (!email || !password) return badRequest("email and password are required.");

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (!user || !(await verifyPassword(password, user.hashed_password))) {
    return Response.json({ success: false, error: "Invalid email or password." }, { status: 401 });
  }
  if (!user.is_active) {
    return Response.json({ success: false, error: "Account is disabled." }, { status: 403 });
  }
  const userRole = user.role || "recruiter";
  if (role && role !== userRole) {
    const nice = role === "candidate" ? "a candidate account" : "a recruiter account";
    return Response.json({ success: false, error: `This email is not registered as ${nice}.` }, { status: 403 });
  }

  const token = await createToken(user.id);
  const safeUser = { ...user } as any;
  delete safeUser.hashed_password;
  safeUser.role = userRole;
  return Response.json({ access_token: token, token_type: "bearer", user: safeUser });
}
