"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Candidate, DashboardStats, Interview, Job } from "@/types";

function normalizeCandidate(c: Candidate): Candidate {
  return {
    ...c,
    avatar: c.name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2),
    fitScore: c.fit_score,
    resumeScore: c.resume_score,
    biasFlag: c.bias_flag,
    appliedDate: c.applied_date,
  };
}

function normalizeJob(j: Job): Job {
  return { ...j, avgScore: j.avg_score, postedDate: j.posted_date };
}

function normalizeInterview(i: Interview): Interview {
  return {
    ...i,
    candidateName: i.candidate_name,
    candidateAvatar: i.candidate_avatar,
    aiInsight: i.ai_insight,
  };
}

export function useCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<{ data: Candidate[] }>("/candidates");
      setCandidates(res.data.map(normalizeCandidate));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load candidates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { candidates, loading, error, refetch: fetch };
}

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<{ data: Job[] }>("/jobs");
      setJobs(res.data.map(normalizeJob));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { jobs, loading, error, refetch: fetch };
}

export function useInterviews() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<{ data: Interview[] }>("/interviews");
      setInterviews(res.data.map(normalizeInterview));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load interviews");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { interviews, loading, error, refetch: fetch };
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<DashboardStats>("/dashboard/stats")
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
}

export interface Analytics {
  kpi: { avg_fit_score: number; hire_success_rate: number; bias_free_score: number; diversity_index: number };
  funnel: { stage: string; count: number; color: string }[];
  pipeline: { month: string; applications: number; interviewed: number; hired: number }[];
  diversity: { name: string; value: number; color: string }[];
  predictions: { month: string; predicted: number; actual: number }[];
  accuracy: { label: string; value: number; color: string }[];
}

export function useAnalytics() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Analytics>("/dashboard/analytics")
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return { analytics: data, loading };
}
