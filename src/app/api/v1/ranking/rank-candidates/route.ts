/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest } from "next/server";
import { authenticateRecruiter, unauthorized, forbidden, badRequest } from "@/lib/apiHelpers";
import { scoreResume } from "@/lib/resumeEngine";

export async function POST(req: NextRequest) {
  const userId = await authenticateRecruiter(req);
  if (userId === null) return unauthorized();
  if (userId === -1) return forbidden("Recruiter access required.");

  const { resumes, job_description } = await req.json();
  if (!resumes?.length) return badRequest("At least one resume is required.");
  if (!job_description || job_description.trim().length < 10) return badRequest("job_description must be at least 10 characters.");

  const ranked = resumes.map((resume: any, idx: number) => {
    try {
      const score = scoreResume(resume, job_description);
      return {
        candidate_id: resume.id ?? resume.filename ?? `candidate_${idx}`,
        name: resume.name ?? null,
        email: resume.email ?? null,
        ...score,
      };
    } catch (e: any) {
      return {
        candidate_id: resume.id ?? resume.filename ?? `candidate_${idx}`,
        name: resume.name ?? null,
        fit_score: 0,
        recommendation: "Reject",
        error: e.message,
      };
    }
  }).sort((a: any, b: any) => b.fit_score - a.fit_score)
    .map((r: any, i: number) => ({ ...r, rank: i + 1 }));

  return Response.json({
    success: true,
    total: ranked.length,
    job_description_preview: job_description.slice(0, 200),
    results: ranked,
  });
}
