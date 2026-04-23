/* eslint-disable @typescript-eslint/no-explicit-any */

import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "hiremind.db");

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'recruiter',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    location TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'full-time',
    status TEXT NOT NULL DEFAULT 'active',
    description TEXT,
    skills TEXT NOT NULL DEFAULT '[]',
    posted_date TEXT NOT NULL DEFAULT (datetime('now')),
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
  );
  CREATE TABLE IF NOT EXISTS candidates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL,
    experience TEXT,
    skills TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'new',
    fit_score REAL NOT NULL DEFAULT 0,
    resume_score REAL NOT NULL DEFAULT 0,
    bias_flag INTEGER NOT NULL DEFAULT 0,
    diversity_score REAL NOT NULL DEFAULT 0,
    success_prediction REAL NOT NULL DEFAULT 0,
    applied_date TEXT NOT NULL DEFAULT (datetime('now')),
    job_id INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    resume_filename TEXT
  );
  CREATE TABLE IF NOT EXISTS interviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled',
    rating REAL,
    ai_insight TEXT,
    interviewer TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Reset non-user tables for idempotent seeding
db.exec("DELETE FROM interviews; DELETE FROM candidates; DELETE FROM jobs;");
db.exec("DELETE FROM sqlite_sequence WHERE name IN ('interviews','candidates','jobs');");

// Demo recruiter
const existing = db.prepare("SELECT id FROM users WHERE email = ?").get("carter@hiremind.ai");
if (!existing) {
  const hashed = bcrypt.hashSync("password123", 10);
  db.prepare("INSERT INTO users (name, email, hashed_password, role) VALUES (?, ?, ?, 'recruiter')").run("Carter Admin", "carter@hiremind.ai", hashed);
  console.log("Created demo recruiter: carter@hiremind.ai / password123");
}
const user = db.prepare("SELECT id FROM users WHERE email = ?").get("carter@hiremind.ai") as any;

// Demo candidate
const demoCand = db.prepare("SELECT id FROM users WHERE email = ?").get("alex@candidate.ai");
if (!demoCand) {
  const hashed = bcrypt.hashSync("password123", 10);
  db.prepare("INSERT INTO users (name, email, hashed_password, role) VALUES (?, ?, ?, 'candidate')").run("Alex Candidate", "alex@candidate.ai", hashed);
  console.log("Created demo candidate: alex@candidate.ai / password123");
}

// Jobs
const jobsData = [
  { title: "Senior Frontend Engineer", department: "Engineering", location: "San Francisco, CA", type: "full-time", status: "active", skills: ["React", "TypeScript", "Next.js"], posted_date: "2026-02-10T00:00:00" },
  { title: "ML Engineer", department: "AI/ML", location: "Remote", type: "remote", status: "active", skills: ["Python", "TensorFlow", "NLP"], posted_date: "2026-02-08T00:00:00" },
  { title: "DevOps Engineer", department: "Infrastructure", location: "New York, NY", type: "full-time", status: "active", skills: ["Kubernetes", "AWS", "Terraform"], posted_date: "2026-02-12T00:00:00" },
  { title: "UX Designer", department: "Design", location: "Austin, TX", type: "full-time", status: "paused", skills: ["Figma", "User Research", "Prototyping"], posted_date: "2026-02-05T00:00:00" },
  { title: "Backend Engineer", department: "Engineering", location: "Remote", type: "remote", status: "active", skills: ["Go", "gRPC", "Microservices"], posted_date: "2026-02-15T00:00:00" },
  { title: "Data Scientist", department: "AI/ML", location: "Seattle, WA", type: "full-time", status: "closed", skills: ["Python", "SQL", "Spark"], posted_date: "2026-01-28T00:00:00" },
];

const insertJob = db.prepare("INSERT OR IGNORE INTO jobs (title, department, location, type, status, skills, posted_date, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
for (const j of jobsData) {
  insertJob.run(j.title, j.department, j.location, j.type, j.status, JSON.stringify(j.skills), j.posted_date, user.id);
}
const jobs = db.prepare("SELECT id, title FROM jobs").all() as any[];
const jobMap: Record<string, number> = {};
for (const j of jobs) jobMap[j.title] = j.id;

// Candidates
const candidatesData = [
  { name: "Sarah Chen", email: "sarah.chen@email.com", role: "Senior Frontend Engineer", experience: "7 years", skills: ["React", "TypeScript", "Next.js", "GraphQL", "Tailwind"], status: "interview", fit_score: 94, resume_score: 92, bias_flag: 0, diversity_score: 88, success_prediction: 91, applied_date: "2026-02-18T00:00:00", job: "Senior Frontend Engineer" },
  { name: "Marcus Johnson", email: "marcus.j@email.com", role: "Full Stack Developer", experience: "5 years", skills: ["Node.js", "React", "PostgreSQL", "Docker", "AWS"], status: "screening", fit_score: 89, resume_score: 87, bias_flag: 0, diversity_score: 82, success_prediction: 85, applied_date: "2026-02-19T00:00:00", job: "Backend Engineer" },
  { name: "Priya Sharma", email: "priya.s@email.com", role: "ML Engineer", experience: "6 years", skills: ["Python", "TensorFlow", "PyTorch", "NLP", "MLOps"], status: "offer", fit_score: 96, resume_score: 95, bias_flag: 0, diversity_score: 90, success_prediction: 94, applied_date: "2026-02-14T00:00:00", job: "ML Engineer" },
  { name: "James Wilson", email: "james.w@email.com", role: "DevOps Engineer", experience: "4 years", skills: ["Kubernetes", "Terraform", "AWS", "CI/CD", "Linux"], status: "screening", fit_score: 78, resume_score: 76, bias_flag: 1, diversity_score: 70, success_prediction: 72, applied_date: "2026-02-20T00:00:00", job: "DevOps Engineer" },
  { name: "Aisha Rahman", email: "aisha.r@email.com", role: "UX Designer", experience: "5 years", skills: ["Figma", "User Research", "Prototyping", "Design Systems", "A/B Testing"], status: "interview", fit_score: 91, resume_score: 89, bias_flag: 0, diversity_score: 92, success_prediction: 88, applied_date: "2026-02-16T00:00:00", job: "UX Designer" },
  { name: "David Park", email: "david.p@email.com", role: "Backend Engineer", experience: "6 years", skills: ["Go", "gRPC", "Microservices", "Redis", "Kafka"], status: "new", fit_score: 85, resume_score: 83, bias_flag: 0, diversity_score: 78, success_prediction: 80, applied_date: "2026-02-21T00:00:00", job: "Backend Engineer" },
  { name: "Elena Rodriguez", email: "elena.r@email.com", role: "Data Scientist", experience: "4 years", skills: ["Python", "R", "SQL", "Spark", "Tableau"], status: "interview", fit_score: 92, resume_score: 90, bias_flag: 0, diversity_score: 86, success_prediction: 89, applied_date: "2026-02-17T00:00:00", job: "Data Scientist" },
  { name: "Tom Anderson", email: "tom.a@email.com", role: "Product Manager", experience: "8 years", skills: ["Agile", "Roadmapping", "Analytics", "Stakeholder Mgmt"], status: "rejected", fit_score: 73, resume_score: 68, bias_flag: 1, diversity_score: 65, success_prediction: 60, applied_date: "2026-02-12T00:00:00", job: null },
];

const insertCandidate = db.prepare("INSERT OR IGNORE INTO candidates (name, email, role, experience, skills, status, fit_score, resume_score, bias_flag, diversity_score, success_prediction, applied_date, job_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
for (const c of candidatesData) {
  const job_id = c.job ? (jobMap[c.job] || null) : null;
  insertCandidate.run(c.name, c.email, c.role, c.experience, JSON.stringify(c.skills), c.status, c.fit_score, c.resume_score, c.bias_flag, c.diversity_score, c.success_prediction, c.applied_date, job_id);
}
const candidateMap: Record<string, number> = {};
const allCandidates = db.prepare("SELECT id, name FROM candidates").all() as any[];
for (const c of allCandidates) candidateMap[c.name] = c.id;

// Interviews
const interviewsData = [
  { candidate: "Sarah Chen", role: "Senior Frontend Engineer", date: "2026-02-23", time: "10:00 AM", type: "technical", status: "scheduled", interviewer: "Alex Rivera", rating: null, ai_insight: null },
  { candidate: "Aisha Rahman", role: "UX Designer", date: "2026-02-23", time: "2:00 PM", type: "behavioral", status: "scheduled", interviewer: "Lisa Wang", rating: null, ai_insight: null },
  { candidate: "Elena Rodriguez", role: "Data Scientist", date: "2026-02-24", time: "11:00 AM", type: "technical", status: "scheduled", interviewer: "Mike Thompson", rating: null, ai_insight: null },
  { candidate: "Priya Sharma", role: "ML Engineer", date: "2026-02-20", time: "3:00 PM", type: "final", status: "completed", interviewer: "Dr. James Lee", rating: 4.8, ai_insight: "Exceptional problem-solving skills. Strong system design thinking. Recommend hire with senior-level compensation." },
  { candidate: "Marcus Johnson", role: "Full Stack Developer", date: "2026-02-19", time: "1:00 PM", type: "technical", status: "completed", interviewer: "Sarah Kim", rating: 4.2, ai_insight: "Strong coding fundamentals. Good communication. Could improve on system design. Recommend next round." },
  { candidate: "David Park", role: "Backend Engineer", date: "2026-02-25", time: "9:00 AM", type: "cultural", status: "scheduled", interviewer: "Rachel Green", rating: null, ai_insight: null },
];

const insertInterview = db.prepare("INSERT OR IGNORE INTO interviews (candidate_id, role, date, time, type, status, interviewer, rating, ai_insight) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
for (const iv of interviewsData) {
  const cid = candidateMap[iv.candidate];
  if (cid) insertInterview.run(cid, iv.role, iv.date, iv.time, iv.type, iv.status, iv.interviewer, iv.rating, iv.ai_insight);
}

console.log("Seed complete.");
db.close();
