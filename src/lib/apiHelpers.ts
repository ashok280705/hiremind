import { NextRequest } from "next/server";
import { verifyToken } from "./auth";
import { supabase } from "./db";

export async function authenticate(req: NextRequest): Promise<number | null> {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  const userId = await verifyToken(token);
  if (!userId) return null;
  const { data } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .eq("is_active", true)
    .single();
  return data ? userId : null;
}

export async function authenticateWithRole(req: NextRequest): Promise<{ userId: number; role: string } | null> {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  const userId = await verifyToken(token);
  if (!userId) return null;
  const { data } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", userId)
    .eq("is_active", true)
    .single();
  return data ? { userId: data.id, role: data.role || "recruiter" } : null;
}

export function forbidden(msg = "Forbidden") {
  return Response.json({ success: false, error: msg }, { status: 403 });
}

export async function authenticateRecruiter(req: NextRequest): Promise<number | null> {
  const auth = await authenticateWithRole(req);
  if (!auth) return null;
  return auth.role === "recruiter" ? auth.userId : -1; // -1 signals "wrong role"
}

export function unauthorized() {
  return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
}

export function notFound(msg = "Not found") {
  return Response.json({ success: false, error: msg }, { status: 404 });
}

export function badRequest(msg: string) {
  return Response.json({ success: false, error: msg }, { status: 400 });
}
