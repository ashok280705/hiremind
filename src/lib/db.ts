import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "hiremind.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  initSchema(_db);
  runMigrations(_db);
  return _db;
}

function runMigrations(db: Database.Database) {
  const userCols = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
  if (!userCols.some((c) => c.name === "role")) {
    db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'recruiter'");
  }
  const candCols = db.prepare("PRAGMA table_info(candidates)").all() as { name: string }[];
  if (!candCols.some((c) => c.name === "user_id")) {
    db.exec("ALTER TABLE candidates ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL");
  }
  if (!candCols.some((c) => c.name === "resume_filename")) {
    db.exec("ALTER TABLE candidates ADD COLUMN resume_filename TEXT");
  }
}

function initSchema(db: Database.Database) {
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

    CREATE TABLE IF NOT EXISTS resumes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      name TEXT,
      email TEXT,
      phone TEXT,
      experience_years REAL NOT NULL DEFAULT 0,
      skills TEXT NOT NULL DEFAULT '[]',
      education TEXT NOT NULL DEFAULT '[]',
      raw_text TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
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
}
