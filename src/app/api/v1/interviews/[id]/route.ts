import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { authenticateRecruiter, unauthorized, forbidden, notFound } from "@/lib/apiHelpers";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await authenticateRecruiter(req);
  if (userId === null) return unauthorized();
  if (userId === -1) return forbidden("Recruiter access required.");
  const { id } = await params;
  const db = getDb();
  if (!db.prepare("SELECT id FROM interviews WHERE id = ?").get(id)) return notFound("Interview not found.");
  db.prepare("DELETE FROM interviews WHERE id = ?").run(id);
  return new Response(null, { status: 204 });
}
