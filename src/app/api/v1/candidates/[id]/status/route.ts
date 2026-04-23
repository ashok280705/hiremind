/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { authenticateRecruiter, unauthorized, forbidden, notFound, badRequest } from "@/lib/apiHelpers";

const VALID = new Set(["new", "screening", "interview", "offer", "hired", "rejected"]);

function candidateOut(c: any) {
  return { ...c, skills: JSON.parse(c.skills || "[]"), bias_flag: !!c.bias_flag };
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await authenticateRecruiter(req);
  if (userId === null) return unauthorized();
  if (userId === -1) return forbidden("Recruiter access required.");
  const { id } = await params;
  const { status } = await req.json();
  if (!VALID.has(status)) return badRequest(`Invalid status. Must be one of: ${[...VALID].join(", ")}`);

  const db = getDb();
  if (!db.prepare("SELECT id FROM candidates WHERE id = ?").get(id)) return notFound("Candidate not found.");
  db.prepare("UPDATE candidates SET status = ? WHERE id = ?").run(status, id);
  const candidate = db.prepare("SELECT * FROM candidates WHERE id = ?").get(id);
  return Response.json(candidateOut(candidate));
}
