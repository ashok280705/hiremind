/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { authenticateRecruiter, unauthorized, forbidden, notFound } from "@/lib/apiHelpers";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await authenticateRecruiter(req);
  if (userId === null) return unauthorized();
  if (userId === -1) return forbidden("Recruiter access required.");
  const { id } = await params;
  const { rating, ai_insight = null } = await req.json();

  const db = getDb();
  if (!db.prepare("SELECT id FROM interviews WHERE id = ?").get(id)) return notFound("Interview not found.");
  db.prepare("UPDATE interviews SET status = 'completed', rating = ?, ai_insight = ? WHERE id = ?").run(rating, ai_insight, id);

  const iv = db.prepare("SELECT * FROM interviews WHERE id = ?").get(id) as any;
  const candidate = db.prepare("SELECT name FROM candidates WHERE id = ?").get(iv.candidate_id) as any;
  const name = candidate?.name || "";
  const candidate_avatar = name.split(" ").map((p: string) => p[0]).join("").toUpperCase().slice(0, 2) || "?";
  return Response.json({ ...iv, candidate_name: name, candidate_avatar });
}
