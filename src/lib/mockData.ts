export interface Candidate {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
  fitScore: number;
  skills: string[];
  experience: string;
  status: "new" | "screening" | "interview" | "offer" | "hired" | "rejected";
  appliedDate: string;
  resumeScore: number;
  biasFlag: boolean;
  diversityScore: number;
  successPrediction: number;
}

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "remote";
  status: "active" | "paused" | "closed";
  applicants: number;
  avgScore: number;
  postedDate: string;
  skills: string[];
}

export interface Interview {
  id: string;
  candidateName: string;
  candidateAvatar: string;
  role: string;
  date: string;
  time: string;
  type: "technical" | "behavioral" | "cultural" | "final";
  status: "scheduled" | "completed" | "cancelled";
  rating?: number;
  aiInsight?: string;
  interviewer: string;
}

export interface AnalyticsData {
  month: string;
  applications: number;
  screened: number;
  interviewed: number;
  hired: number;
}

export const candidates: Candidate[] = [
  {
    id: "1",
    name: "Sarah Chen",
    role: "Senior Frontend Engineer",
    email: "sarah.chen@email.com",
    avatar: "SC",
    fitScore: 94,
    skills: ["React", "TypeScript", "Next.js", "GraphQL", "Tailwind"],
    experience: "7 years",
    status: "interview",
    appliedDate: "2026-02-18",
    resumeScore: 92,
    biasFlag: false,
    diversityScore: 88,
    successPrediction: 91,
  },
  {
    id: "2",
    name: "Marcus Johnson",
    role: "Full Stack Developer",
    email: "marcus.j@email.com",
    avatar: "MJ",
    fitScore: 89,
    skills: ["Node.js", "React", "PostgreSQL", "Docker", "AWS"],
    experience: "5 years",
    status: "screening",
    appliedDate: "2026-02-19",
    resumeScore: 87,
    biasFlag: false,
    diversityScore: 82,
    successPrediction: 85,
  },
  {
    id: "3",
    name: "Priya Sharma",
    role: "ML Engineer",
    email: "priya.s@email.com",
    avatar: "PS",
    fitScore: 96,
    skills: ["Python", "TensorFlow", "PyTorch", "NLP", "MLOps"],
    experience: "6 years",
    status: "offer",
    appliedDate: "2026-02-14",
    resumeScore: 95,
    biasFlag: false,
    diversityScore: 90,
    successPrediction: 94,
  },
  {
    id: "4",
    name: "James Wilson",
    role: "DevOps Engineer",
    email: "james.w@email.com",
    avatar: "JW",
    fitScore: 78,
    skills: ["Kubernetes", "Terraform", "AWS", "CI/CD", "Linux"],
    experience: "4 years",
    status: "screening",
    appliedDate: "2026-02-20",
    resumeScore: 76,
    biasFlag: true,
    diversityScore: 70,
    successPrediction: 72,
  },
  {
    id: "5",
    name: "Aisha Rahman",
    role: "UX Designer",
    email: "aisha.r@email.com",
    avatar: "AR",
    fitScore: 91,
    skills: ["Figma", "User Research", "Prototyping", "Design Systems", "A/B Testing"],
    experience: "5 years",
    status: "interview",
    appliedDate: "2026-02-16",
    resumeScore: 89,
    biasFlag: false,
    diversityScore: 92,
    successPrediction: 88,
  },
  {
    id: "6",
    name: "David Park",
    role: "Backend Engineer",
    email: "david.p@email.com",
    avatar: "DP",
    fitScore: 85,
    skills: ["Go", "gRPC", "Microservices", "Redis", "Kafka"],
    experience: "6 years",
    status: "new",
    appliedDate: "2026-02-21",
    resumeScore: 83,
    biasFlag: false,
    diversityScore: 78,
    successPrediction: 80,
  },
  {
    id: "7",
    name: "Elena Rodriguez",
    role: "Data Scientist",
    email: "elena.r@email.com",
    avatar: "ER",
    fitScore: 92,
    skills: ["Python", "R", "SQL", "Spark", "Tableau"],
    experience: "4 years",
    status: "interview",
    appliedDate: "2026-02-17",
    resumeScore: 90,
    biasFlag: false,
    diversityScore: 86,
    successPrediction: 89,
  },
  {
    id: "8",
    name: "Tom Anderson",
    role: "Product Manager",
    email: "tom.a@email.com",
    avatar: "TA",
    fitScore: 73,
    skills: ["Agile", "Roadmapping", "Analytics", "Stakeholder Mgmt"],
    experience: "8 years",
    status: "rejected",
    appliedDate: "2026-02-12",
    resumeScore: 68,
    biasFlag: true,
    diversityScore: 65,
    successPrediction: 60,
  },
];

export const jobs: Job[] = [
  {
    id: "1",
    title: "Senior Frontend Engineer",
    department: "Engineering",
    location: "San Francisco, CA",
    type: "full-time",
    status: "active",
    applicants: 47,
    avgScore: 82,
    postedDate: "2026-02-10",
    skills: ["React", "TypeScript", "Next.js"],
  },
  {
    id: "2",
    title: "ML Engineer",
    department: "AI/ML",
    location: "Remote",
    type: "remote",
    status: "active",
    applicants: 63,
    avgScore: 78,
    postedDate: "2026-02-08",
    skills: ["Python", "TensorFlow", "NLP"],
  },
  {
    id: "3",
    title: "DevOps Engineer",
    department: "Infrastructure",
    location: "New York, NY",
    type: "full-time",
    status: "active",
    applicants: 31,
    avgScore: 75,
    postedDate: "2026-02-12",
    skills: ["Kubernetes", "AWS", "Terraform"],
  },
  {
    id: "4",
    title: "UX Designer",
    department: "Design",
    location: "Austin, TX",
    type: "full-time",
    status: "paused",
    applicants: 28,
    avgScore: 84,
    postedDate: "2026-02-05",
    skills: ["Figma", "User Research", "Prototyping"],
  },
  {
    id: "5",
    title: "Backend Engineer",
    department: "Engineering",
    location: "Remote",
    type: "remote",
    status: "active",
    applicants: 55,
    avgScore: 79,
    postedDate: "2026-02-15",
    skills: ["Go", "gRPC", "Microservices"],
  },
  {
    id: "6",
    title: "Data Scientist",
    department: "AI/ML",
    location: "Seattle, WA",
    type: "full-time",
    status: "closed",
    applicants: 42,
    avgScore: 81,
    postedDate: "2026-01-28",
    skills: ["Python", "SQL", "Spark"],
  },
];

export const interviews: Interview[] = [
  {
    id: "1",
    candidateName: "Sarah Chen",
    candidateAvatar: "SC",
    role: "Senior Frontend Engineer",
    date: "2026-02-23",
    time: "10:00 AM",
    type: "technical",
    status: "scheduled",
    interviewer: "Alex Rivera",
  },
  {
    id: "2",
    candidateName: "Aisha Rahman",
    candidateAvatar: "AR",
    role: "UX Designer",
    date: "2026-02-23",
    time: "2:00 PM",
    type: "behavioral",
    status: "scheduled",
    interviewer: "Lisa Wang",
  },
  {
    id: "3",
    candidateName: "Elena Rodriguez",
    candidateAvatar: "ER",
    role: "Data Scientist",
    date: "2026-02-24",
    time: "11:00 AM",
    type: "technical",
    status: "scheduled",
    interviewer: "Mike Thompson",
  },
  {
    id: "4",
    candidateName: "Priya Sharma",
    candidateAvatar: "PS",
    role: "ML Engineer",
    date: "2026-02-20",
    time: "3:00 PM",
    type: "final",
    status: "completed",
    rating: 4.8,
    aiInsight: "Exceptional problem-solving skills. Strong system design thinking. Recommend hire with senior-level compensation.",
    interviewer: "Dr. James Lee",
  },
  {
    id: "5",
    candidateName: "Marcus Johnson",
    candidateAvatar: "MJ",
    role: "Full Stack Developer",
    date: "2026-02-19",
    time: "1:00 PM",
    type: "technical",
    status: "completed",
    rating: 4.2,
    aiInsight: "Strong coding fundamentals. Good communication. Could improve on system design. Recommend next round.",
    interviewer: "Sarah Kim",
  },
  {
    id: "6",
    candidateName: "David Park",
    candidateAvatar: "DP",
    role: "Backend Engineer",
    date: "2026-02-25",
    time: "9:00 AM",
    type: "cultural",
    status: "scheduled",
    interviewer: "Rachel Green",
  },
];

export const analyticsData: AnalyticsData[] = [
  { month: "Sep", applications: 180, screened: 120, interviewed: 45, hired: 8 },
  { month: "Oct", applications: 220, screened: 150, interviewed: 55, hired: 12 },
  { month: "Nov", applications: 195, screened: 135, interviewed: 50, hired: 10 },
  { month: "Dec", applications: 160, screened: 110, interviewed: 38, hired: 7 },
  { month: "Jan", applications: 240, screened: 170, interviewed: 62, hired: 15 },
  { month: "Feb", applications: 210, screened: 155, interviewed: 58, hired: 13 },
];

export const diversityData = [
  { name: "Gender Balanced", value: 48, color: "#7c3aed" },
  { name: "Ethnic Diversity", value: 72, color: "#06b6d4" },
  { name: "Age Diversity", value: 65, color: "#10b981" },
  { name: "Background Diversity", value: 58, color: "#f59e0b" },
];

export const funnelData = [
  { stage: "Applied", count: 1205, color: "#7c3aed" },
  { stage: "Screened", count: 840, color: "#a78bfa" },
  { stage: "Interviewed", count: 308, color: "#06b6d4" },
  { stage: "Offered", count: 65, color: "#10b981" },
  { stage: "Hired", count: 42, color: "#f59e0b" },
];

export const kpiStats = {
  activeJobs: 12,
  totalCandidates: 1205,
  scheduledInterviews: 28,
  hiresThisMonth: 13,
  activeJobsTrend: +8.3,
  candidatesTrend: +12.5,
  interviewsTrend: -3.2,
  hiresTrend: +18.7,
};
