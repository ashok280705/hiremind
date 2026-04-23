/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest } from "next/server";
import { authenticateRecruiter, unauthorized, forbidden, badRequest } from "@/lib/apiHelpers";
import { scoreResume } from "@/lib/resumeEngine";

export async function POST(req: NextRequest) {
  const userId = await authenticateRecruiter(req);
  if (userId === null) return unauthorized();
  if (userId === -1) return forbidden("Recruiter access required.");

  const { resume, job_description } = await req.json();
  if (!resume || !job_description) return badRequest("resume and job_description are required.");
  if (job_description.trim().length < 10) return badRequest("job_description must be at least 10 characters.");

  try {
    const result = scoreResume(resume, job_description);
    return Response.json(result);
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 422 });
  }
}
