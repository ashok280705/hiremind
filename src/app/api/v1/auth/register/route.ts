import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { hashPassword, createToken } from "@/lib/auth";
import { badRequest } from "@/lib/apiHelpers";

export async function POST(req: NextRequest) {
  const { name, email, password, role } = await req.json();
  if (!name || !email || !password) return badRequest("name, email and password are required.");

  const normalizedRole = role === "candidate" ? "candidate" : "recruiter";

  const db = getDb();
  if (db.prepare("SELECT id FROM users WHERE email = ?").get(email)) {
    return badRequest("Email already registered.");
  }

  const hashed = await hashPassword(password);
  const result = db.prepare(
    "INSERT INTO users (name, email, hashed_password, role) VALUES (?, ?, ?, ?)"
  ).run(name, email, hashed, normalizedRole);

  const user = db.prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?").get(result.lastInsertRowid);
  const token = await createToken(Number(result.lastInsertRowid));
  return Response.json({ access_token: token, token_type: "bearer", user }, { status: 201 });
}
