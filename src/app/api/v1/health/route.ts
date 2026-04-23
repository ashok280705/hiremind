export async function GET() {
  return Response.json({ status: "ok", app: "HireMind", backend: "Next.js API Routes", db: "SQLite" });
}
