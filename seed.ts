/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Seeding Supabase database...");

  // Reset non-user tables for idempotent seeding
  await supabase.from("interviews").delete().neq("id", 0);
  await supabase.from("candidates").delete().neq("id", 0);
  await supabase.from("jobs").delete().neq("id", 0);
  console.log("Cleared interviews, candidates, and jobs tables.");

  // Demo recruiter
  const { data: existingRecruiter } = await supabase
    .from("users")
    .select("id")
    .eq("email", "carter@hiremind.ai")
    .single();

  let recruiterId: number;
  if (!existingRecruiter) {
    const hashed = bcrypt.hashSync("password123", 10);
    const { data: newUser } = await supabase
      .from("users")
      .insert({ name: "Carter Admin", email: "carter@hiremind.ai", hashed_password: hashed, role: "recruiter" })
      .select("id")
      .single();
    recruiterId = newUser!.id;
    console.log("Created demo recruiter: carter@hiremind.ai / password123");
  } else {
    recruiterId = existingRecruiter.id;
    console.log("Demo recruiter already exists.");
  }

  // Demo candidate
  const { data: existingCandidate } = await supabase
    .from("users")
    .select("id")
    .eq("email", "alex@candidate.ai")
    .single();

  if (!existingCandidate) {
    const hashed = bcrypt.hashSync("password123", 10);
    await supabase
      .from("users")
      .insert({ name: "Alex Candidate", email: "alex@candidate.ai", hashed_password: hashed, role: "candidate" })
      .select("id")
      .single();
    console.log("Created demo candidate: alex@candidate.ai / password123");
  } else {
    console.log("Demo candidate already exists.");
  }

  // Jobs
  const jobsData = [
    { title: "Senior Frontend Engineer", department: "Engineering", location: "San Francisco, CA", type: "full-time", status: "active", skills: ["React", "TypeScript", "Next.js"], posted_date: "2026-02-10T00:00:00Z", created_by: recruiterId },
    { title: "ML Engineer", department: "AI/ML", location: "Remote", type: "remote", status: "active", skills: ["Python", "TensorFlow", "NLP"], posted_date: "2026-02-08T00:00:00Z", created_by: recruiterId },
    { title: "DevOps Engineer", department: "Infrastructure", location: "New York, NY", type: "full-time", status: "active", skills: ["Kubernetes", "AWS", "Terraform"], posted_date: "2026-02-12T00:00:00Z", created_by: recruiterId },
    { title: "UX Designer", department: "Design", location: "Austin, TX", type: "full-time", status: "paused", skills: ["Figma", "User Research", "Prototyping"], posted_date: "2026-02-05T00:00:00Z", created_by: recruiterId },
    { title: "Backend Engineer", department: "Engineering", location: "Remote", type: "remote", status: "active", skills: ["Go", "gRPC", "Microservices"], posted_date: "2026-02-15T00:00:00Z", created_by: recruiterId },
    { title: "Data Scientist", department: "AI/ML", location: "Seattle, WA", type: "full-time", status: "closed", skills: ["Python", "SQL", "Spark"], posted_date: "2026-01-28T00:00:00Z", created_by: recruiterId },
  ];

  const { data: insertedJobs } = await supabase.from("jobs").insert(jobsData).select("id, title");
  const jobMap: Record<string, number> = {};
  for (const j of (insertedJobs || [])) {
    jobMap[j.title] = j.id;
  }
  console.log(`Inserted ${insertedJobs?.length || 0} jobs.`);

  // Candidates
  const candidatesData = [
    { name: "Sarah Chen", email: "sarah.chen@email.com", role: "Senior Frontend Engineer", experience: "7 years", skills: ["React", "TypeScript", "Next.js", "GraphQL", "Tailwind"], status: "interview", fit_score: 94, resume_score: 92, bias_flag: false, diversity_score: 88, success_prediction: 91, applied_date: "2026-02-18T00:00:00Z", job_id: jobMap["Senior Frontend Engineer"] || null },
    { name: "Marcus Johnson", email: "marcus.j@email.com", role: "Full Stack Developer", experience: "5 years", skills: ["Node.js", "React", "PostgreSQL", "Docker", "AWS"], status: "screening", fit_score: 89, resume_score: 87, bias_flag: false, diversity_score: 82, success_prediction: 85, applied_date: "2026-02-19T00:00:00Z", job_id: jobMap["Backend Engineer"] || null },
    { name: "Priya Sharma", email: "priya.s@email.com", role: "ML Engineer", experience: "6 years", skills: ["Python", "TensorFlow", "PyTorch", "NLP", "MLOps"], status: "offer", fit_score: 96, resume_score: 95, bias_flag: false, diversity_score: 90, success_prediction: 94, applied_date: "2026-02-14T00:00:00Z", job_id: jobMap["ML Engineer"] || null },
    { name: "James Wilson", email: "james.w@email.com", role: "DevOps Engineer", experience: "4 years", skills: ["Kubernetes", "Terraform", "AWS", "CI/CD", "Linux"], status: "screening", fit_score: 78, resume_score: 76, bias_flag: true, diversity_score: 70, success_prediction: 72, applied_date: "2026-02-20T00:00:00Z", job_id: jobMap["DevOps Engineer"] || null },
    { name: "Aisha Rahman", email: "aisha.r@email.com", role: "UX Designer", experience: "5 years", skills: ["Figma", "User Research", "Prototyping", "Design Systems", "A/B Testing"], status: "interview", fit_score: 91, resume_score: 89, bias_flag: false, diversity_score: 92, success_prediction: 88, applied_date: "2026-02-16T00:00:00Z", job_id: jobMap["UX Designer"] || null },
    { name: "David Park", email: "david.p@email.com", role: "Backend Engineer", experience: "6 years", skills: ["Go", "gRPC", "Microservices", "Redis", "Kafka"], status: "new", fit_score: 85, resume_score: 83, bias_flag: false, diversity_score: 78, success_prediction: 80, applied_date: "2026-02-21T00:00:00Z", job_id: jobMap["Backend Engineer"] || null },
    { name: "Elena Rodriguez", email: "elena.r@email.com", role: "Data Scientist", experience: "4 years", skills: ["Python", "R", "SQL", "Spark", "Tableau"], status: "interview", fit_score: 92, resume_score: 90, bias_flag: false, diversity_score: 86, success_prediction: 89, applied_date: "2026-02-17T00:00:00Z", job_id: jobMap["Data Scientist"] || null },
    { name: "Tom Anderson", email: "tom.a@email.com", role: "Product Manager", experience: "8 years", skills: ["Agile", "Roadmapping", "Analytics", "Stakeholder Mgmt"], status: "rejected", fit_score: 73, resume_score: 68, bias_flag: true, diversity_score: 65, success_prediction: 60, applied_date: "2026-02-12T00:00:00Z", job_id: null },
  ];

  const { data: insertedCandidates } = await supabase.from("candidates").insert(candidatesData).select("id, name");
  const candidateMap: Record<string, number> = {};
  for (const c of (insertedCandidates || [])) {
    candidateMap[c.name] = c.id;
  }
  console.log(`Inserted ${insertedCandidates?.length || 0} candidates.`);

  // Interviews
  const interviewsData = [
    { candidate_id: candidateMap["Sarah Chen"], role: "Senior Frontend Engineer", date: "2026-02-23", time: "10:00 AM", type: "technical", status: "scheduled", interviewer: "Alex Rivera", rating: null, ai_insight: null },
    { candidate_id: candidateMap["Aisha Rahman"], role: "UX Designer", date: "2026-02-23", time: "2:00 PM", type: "behavioral", status: "scheduled", interviewer: "Lisa Wang", rating: null, ai_insight: null },
    { candidate_id: candidateMap["Elena Rodriguez"], role: "Data Scientist", date: "2026-02-24", time: "11:00 AM", type: "technical", status: "scheduled", interviewer: "Mike Thompson", rating: null, ai_insight: null },
    { candidate_id: candidateMap["Priya Sharma"], role: "ML Engineer", date: "2026-02-20", time: "3:00 PM", type: "final", status: "completed", interviewer: "Dr. James Lee", rating: 4.8, ai_insight: "Exceptional problem-solving skills. Strong system design thinking. Recommend hire with senior-level compensation." },
    { candidate_id: candidateMap["Marcus Johnson"], role: "Full Stack Developer", date: "2026-02-19", time: "1:00 PM", type: "technical", status: "completed", interviewer: "Sarah Kim", rating: 4.2, ai_insight: "Strong coding fundamentals. Good communication. Could improve on system design. Recommend next round." },
    { candidate_id: candidateMap["David Park"], role: "Backend Engineer", date: "2026-02-25", time: "9:00 AM", type: "cultural", status: "scheduled", interviewer: "Rachel Green", rating: null, ai_insight: null },
  ].filter((iv) => iv.candidate_id); // skip any with missing candidate

  const { data: insertedInterviews } = await supabase.from("interviews").insert(interviewsData).select("id");
  console.log(`Inserted ${insertedInterviews?.length || 0} interviews.`);

  console.log("Seed complete.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
