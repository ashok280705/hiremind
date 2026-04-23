import { NextRequest } from "next/server";
import { verifyToken } from "./auth";
import { getDb } from "./db";

export async function authenticate(req: NextRequest): Promise<number | null> {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  const userId = await verifyToken(token);
  if (!userId) return null;
  const user = getDb().prepare("SELECT id FROM users WHERE id = ? AND is_active = 1").get(userId);
  return user ? userId : null;
}

export async function authenticateWithRole(req: NextRequest): Promise<{ userId: number; role: string } | null> {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  const userId = await verifyToken(token);
  if (!userId) return null;
  const user = getDb().prepare("SELECT id, role FROM users WHERE id = ? AND is_active = 1").get(userId) as { id: number; role: string } | undefined;
  return user ? { userId: user.id, role: user.role || "recruiter" } : null;
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
