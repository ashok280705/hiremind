export interface User {
  id: number;
  name: string;
  email: string;
  role: "recruiter" | "candidate";
  created_at: string;
}

export interface MyApplication {
  id: number;
  applied_date: string;
  status: "new" | "screening" | "interview" | "offer" | "hired" | "rejected";
  fit_score: number;
  resume_score: number;
  skills: string[];
  resume_filename: string | null;
  job: {
    id: number;
    title: string;
    department: string;
    location: string;
    type: string;
    status: string;
  } | null;
  interview: {
    id: number;
    date: string;
    time: string;
    type: string;
    status: string;
    rating: number | null;
  } | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Candidate {
  id: number;
  name: string;
  email: string;
  role: string;
  experience: string | null;
  skills: string[];
  status: "new" | "screening" | "interview" | "offer" | "hired" | "rejected";
  fit_score: number;
  resume_score: number;
  bias_flag: boolean;
  diversity_score: number;
  success_prediction: number;
  applied_date: string;
  job_id: number | null;
  // computed for UI
  avatar?: string;
  fitScore?: number;
  resumeScore?: number;
  biasFlag?: boolean;
  appliedDate?: string;
}

export interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "remote";
  status: "active" | "paused" | "closed";
  description: string | null;
  skills: string[];
  posted_date: string;
  applicants: number;
  avg_score: number;
  // computed for UI
  avgScore?: number;
  postedDate?: string;
}

export interface Interview {
  id: number;
  candidate_id: number;
  candidate_name: string;
  candidate_avatar: string;
  role: string;
  date: string;
  time: string;
  type: "technical" | "behavioral" | "cultural" | "final";
  status: "scheduled" | "completed" | "cancelled";
  rating: number | null;
  ai_insight: string | null;
  interviewer: string;
  // UI aliases
  candidateName?: string;
  candidateAvatar?: string;
  aiInsight?: string | null;
}

export interface DashboardStats {
  active_jobs: number;
  total_candidates: number;
  scheduled_interviews: number;
  hires_this_month: number;
}
