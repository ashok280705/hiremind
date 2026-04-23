/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { authenticateRecruiter, unauthorized, forbidden, notFound } from "@/lib/apiHelpers";

function candidateOut(c: any) {
  return { ...c, skills: JSON.parse(c.skills || "[]"), bias_flag: !!c.bias_flag };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await authenticateRecruiter(req);
  if (userId === null) return unauthorized();
  if (userId === -1) return forbidden("Recruiter access required.");
  const { id } = await params;
  const candidate = getDb().prepare("SELECT * FROM candidates WHERE id = ?").get(id);
  if (!candidate) return notFound("Candidate not found.");
  return Response.json(candidateOut(candidate));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await authenticateRecruiter(req);
  if (userId === null) return unauthorized();
  if (userId === -1) return forbidden("Recruiter access required.");
  const { id } = await params;
  const db = getDb();
  if (!db.prepare("SELECT id FROM candidates WHERE id = ?").get(id)) return notFound("Candidate not found.");

  const body = await req.json();
  const updates: string[] = [];
  const values: unknown[] = [];
  if (typeof body.bias_flag === "boolean") { updates.push("bias_flag = ?"); values.push(body.bias_flag ? 1 : 0); }
  if (typeof body.experience === "string") { updates.push("experience = ?"); values.push(body.experience); }
  if (Array.isArray(body.skills)) { updates.push("skills = ?"); values.push(JSON.stringify(body.skills)); }
  if (!updates.length) return Response.json({ success: false, error: "No valid fields to update." }, { status: 400 });
  values.push(id);
  db.prepare(`UPDATE candidates SET ${updates.join(", ")} WHERE id = ?`).run(...values);
  const candidate = db.prepare("SELECT * FROM candidates WHERE id = ?").get(id);
  return Response.json(candidateOut(candidate));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await authenticateRecruiter(req);
  if (userId === null) return unauthorized();
  if (userId === -1) return forbidden("Recruiter access required.");
  const { id } = await params;
  const db = getDb();
  if (!db.prepare("SELECT id FROM candidates WHERE id = ?").get(id)) return notFound("Candidate not found.");
  db.prepare("DELETE FROM candidates WHERE id = ?").run(id);
  return new Response(null, { status: 204 });
}
