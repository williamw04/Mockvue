import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import type {
  QuestionObservation,
  NormalizedQuestion,
  QuestionCluster,
  IngestionRun,
  QuestionSourceDefinition,
} from './types.js';

export interface StorageConfig {
  dbPath: string;
}

const SCHEMA_VERSION = 1;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS sources (
  name TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  risk_level TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS runs (
  id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  source_names TEXT NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  observation_count INTEGER DEFAULT 0,
  normalized_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS observations (
  id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  role_title TEXT,
  stage TEXT,
  question_text TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  fetched_at TEXT NOT NULL,
  access_method TEXT NOT NULL,
  run_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (source_name) REFERENCES sources(name),
  FOREIGN KEY (run_id) REFERENCES runs(id)
);

CREATE TABLE IF NOT EXISTS normalized_questions (
  id TEXT PRIMARY KEY,
  canonical_question TEXT NOT NULL,
  company_name TEXT NOT NULL,
  role_title TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS clusters (
  id TEXT PRIMARY KEY,
  canonical_question TEXT NOT NULL,
  normalized_question_ids TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_observations_company ON observations(company_name);
CREATE INDEX IF NOT EXISTS idx_observations_source ON observations(source_name);
CREATE INDEX IF NOT EXISTS idx_observations_run ON observations(run_id);
CREATE INDEX IF NOT EXISTS idx_normalized_questions_company ON normalized_questions(company_name);
CREATE INDEX IF NOT EXISTS idx_clusters_canonical ON clusters(canonical_question);
`;

export class Storage {
  private db: Database.Database;

  constructor(config: StorageConfig) {
    const dir = path.dirname(config.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(config.dbPath);
    this.db.pragma('journal_mode = WAL');
    this.initializeSchema();
  }

  private initializeSchema(): void {
    this.db.exec(SCHEMA);

    const versionRow = this.db.prepare('SELECT version FROM schema_version').get() as { version: number } | undefined;

    if (!versionRow) {
      this.db.prepare('INSERT INTO schema_version (version) VALUES (?)').run(SCHEMA_VERSION);
    }
  }

  upsertSource(source: QuestionSourceDefinition): void {
    const stmt = this.db.prepare(`
      INSERT INTO sources (name, kind, risk_level, enabled, description)
      VALUES ($name, $kind, $riskLevel, $enabled, $description)
      ON CONFLICT(name) DO UPDATE SET
        kind = $kind,
        risk_level = $riskLevel,
        enabled = $enabled,
        description = $description,
        updated_at = datetime('now')
    `);

    stmt.run({
      name: source.name,
      kind: source.kind,
      riskLevel: source.riskLevel,
      enabled: source.enabled ? 1 : 0,
      description: source.description,
    });
  }

  createRun(run: IngestionRun, companyName: string): void {
    const stmt = this.db.prepare(`
      INSERT INTO runs (id, company_name, source_names, started_at, completed_at)
      VALUES ($id, $companyName, $sourceNames, $startedAt, $completedAt)
    `);

    stmt.run({
      id: run.id,
      companyName,
      sourceNames: JSON.stringify(run.sourceNames),
      startedAt: run.startedAt,
      completedAt: run.completedAt ?? null,
    });
  }

  completeRun(runId: string, observationCount: number, normalizedCount: number): void {
    const stmt = this.db.prepare(`
      UPDATE runs
      SET completed_at = datetime('now'),
          observation_count = $observationCount,
          normalized_count = $normalizedCount
      WHERE id = $runId
    `);

    stmt.run({ runId, observationCount, normalizedCount });
  }

  upsertObservation(observation: QuestionObservation, runId: string): void {
    const stmt = this.db.prepare(`
      INSERT INTO observations (id, company_name, role_title, stage, question_text, source_name, source_url, fetched_at, access_method, run_id)
      VALUES ($id, $companyName, $roleTitle, $stage, $questionText, $sourceName, $sourceUrl, $fetchedAt, $accessMethod, $runId)
      ON CONFLICT(id) DO UPDATE SET
        company_name = $companyName,
        role_title = $roleTitle,
        stage = $stage,
        question_text = $questionText,
        source_name = $sourceName,
        source_url = $sourceUrl,
        fetched_at = $fetchedAt,
        access_method = $accessMethod,
        run_id = $runId
    `);

    stmt.run({
      id: observation.id,
      companyName: observation.companyName,
      roleTitle: observation.roleTitle ?? null,
      stage: observation.stage ?? null,
      questionText: observation.questionText,
      sourceName: observation.provenance.sourceName,
      sourceUrl: observation.provenance.sourceUrl,
      fetchedAt: observation.provenance.fetchedAt,
      accessMethod: observation.provenance.accessMethod,
      runId,
    });
  }

  upsertObservations(observations: QuestionObservation[], runId: string): void {
    const stmt = this.db.prepare(`
      INSERT INTO observations (id, company_name, role_title, stage, question_text, source_name, source_url, fetched_at, access_method, run_id)
      VALUES ($id, $companyName, $roleTitle, $stage, $questionText, $sourceName, $sourceUrl, $fetchedAt, $accessMethod, $runId)
      ON CONFLICT(id) DO UPDATE SET
        company_name = $companyName,
        role_title = $roleTitle,
        stage = $stage,
        question_text = $questionText,
        source_name = $sourceName,
        source_url = $sourceUrl,
        fetched_at = $fetchedAt,
        access_method = $accessMethod,
        run_id = $runId
    `);

    const insertMany = this.db.transaction((obs: QuestionObservation[]) => {
      for (const observation of obs) {
        stmt.run({
          id: observation.id,
          companyName: observation.companyName,
          roleTitle: observation.roleTitle ?? null,
          stage: observation.stage ?? null,
          questionText: observation.questionText,
          sourceName: observation.provenance.sourceName,
          sourceUrl: observation.provenance.sourceUrl,
          fetchedAt: observation.provenance.fetchedAt,
          accessMethod: observation.provenance.accessMethod,
          runId,
        });
      }
    });

    insertMany(observations);
  }

  upsertNormalizedQuestion(question: NormalizedQuestion): void {
    const stmt = this.db.prepare(`
      INSERT INTO normalized_questions (id, canonical_question, company_name, role_title)
      VALUES ($id, $canonicalQuestion, $companyName, $roleTitle)
      ON CONFLICT(id) DO UPDATE SET
        canonical_question = $canonicalQuestion,
        company_name = $companyName,
        role_title = $roleTitle,
        updated_at = datetime('now')
    `);

    stmt.run({
      id: question.id,
      canonicalQuestion: question.canonicalQuestion,
      companyName: question.companyName,
      roleTitle: question.roleTitle ?? null,
    });
  }

  upsertCluster(cluster: QuestionCluster): void {
    const stmt = this.db.prepare(`
      INSERT INTO clusters (id, canonical_question, normalized_question_ids)
      VALUES ($id, $canonicalQuestion, $normalizedQuestionIds)
      ON CONFLICT(id) DO UPDATE SET
        canonical_question = $canonicalQuestion,
        normalized_question_ids = $normalizedQuestionIds
    `);

    stmt.run({
      id: cluster.id,
      canonicalQuestion: cluster.canonicalQuestion,
      normalizedQuestionIds: JSON.stringify(cluster.normalizedQuestionIds),
    });
  }

  getObservationsByCompany(companyName: string): QuestionObservation[] {
    const stmt = this.db.prepare(`
      SELECT * FROM observations WHERE company_name = ? ORDER BY created_at DESC
    `);

    const rows = stmt.all(companyName) as Array<{
      id: string;
      company_name: string;
      role_title: string | null;
      stage: string | null;
      question_text: string;
      source_name: string;
      source_url: string;
      fetched_at: string;
      access_method: string;
      run_id: string;
    }>;

    return rows.map((row) => ({
      id: row.id,
      companyName: row.company_name,
      roleTitle: row.role_title ?? undefined,
      stage: row.stage ?? undefined,
      questionText: row.question_text,
      provenance: {
        sourceName: row.source_name,
        sourceUrl: row.source_url,
        fetchedAt: row.fetched_at,
        accessMethod: row.access_method as 'http' | 'browser' | 'manual',
      },
    }));
  }

  getObservationsBySource(sourceName: string): QuestionObservation[] {
    const stmt = this.db.prepare(`
      SELECT * FROM observations WHERE source_name = ? ORDER BY created_at DESC
    `);

    const rows = stmt.all(sourceName) as Array<{
      id: string;
      company_name: string;
      role_title: string | null;
      stage: string | null;
      question_text: string;
      source_name: string;
      source_url: string;
      fetched_at: string;
      access_method: string;
    }>;

    return rows.map((row) => ({
      id: row.id,
      companyName: row.company_name,
      roleTitle: row.role_title ?? undefined,
      stage: row.stage ?? undefined,
      questionText: row.question_text,
      provenance: {
        sourceName: row.source_name,
        sourceUrl: row.source_url,
        fetchedAt: row.fetched_at,
        accessMethod: row.access_method as 'http' | 'browser' | 'manual',
      },
    }));
  }

  getNormalizedQuestionsByCompany(companyName: string): NormalizedQuestion[] {
    const stmt = this.db.prepare(`
      SELECT * FROM normalized_questions WHERE company_name = ? ORDER BY created_at DESC
    `);

    const rows = stmt.all(companyName) as Array<{
      id: string;
      canonical_question: string;
      company_name: string;
      role_title: string | null;
    }>;

    return rows.map((row) => ({
      id: row.id,
      canonicalQuestion: row.canonical_question,
      companyName: row.company_name,
      roleTitle: row.role_title ?? undefined,
      observations: [],
    }));
  }

  close(): void {
    this.db.close();
  }
}