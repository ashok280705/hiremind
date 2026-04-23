import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { authenticate, unauthorized, badRequest } from "@/lib/apiHelpers";

export async function GET(req: NextRequest) {
  const userId = await authenticate(req);
  if (!userId) return unauthorized();

  const user = getDb().prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?").get(userId);
  return Response.json(user);
}

export async function PATCH(req: NextRequest) {
  const userId = await authenticate(req);
  if (!userId) return unauthorized();

  const { name, email } = await req.json();
  const db = getDb();

  const updates: string[] = [];
  const values: unknown[] = [];
  if (typeof name === "string" && name.trim()) { updates.push("name = ?"); values.push(name.trim()); }
  if (typeof email === "string" && email.trim()) {
    const existing = db.prepare("SELECT id FROM users WHERE email = ? AND id != ?").get(email.trim(), userId);
    if (existing) return badRequest("Email is already in use by another account.");
    updates.push("email = ?"); values.push(email.trim());
  }
  if (!updates.length) return badRequest("No fields to update.");
  values.push(userId);

  db.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`).run(...values);
  const user = db.prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?").get(userId);
  return Response.json(user);
}
