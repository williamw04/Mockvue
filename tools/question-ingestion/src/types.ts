export type QuestionSourceKind = 'editorial' | 'community' | 'company' | 'aggregator';

export type SourceRiskLevel = 'low' | 'medium' | 'high';

export interface QuestionIngestionConfig {
  outputDir: string;
  cacheDir: string;
  defaultSourceNames: string[];
}

export interface QuestionSourceDefinition {
  name: string;
  kind: QuestionSourceKind;
  riskLevel: SourceRiskLevel;
  enabled: boolean;
  description: string;
}

export interface ProvenanceRecord {
  sourceName: string;
  sourceUrl: string;
  fetchedAt: string;
  accessMethod: 'http' | 'browser' | 'manual';
}

export interface QuestionObservation {
  id: string;
  companyName: string;
  roleTitle?: string;
  stage?: string;
  questionText: string;
  provenance: ProvenanceRecord;
}

export interface NormalizedQuestion {
  id: string;
  canonicalQuestion: string;
  companyName: string;
  roleTitle?: string;
  observations: QuestionObservation[];
}

export interface QuestionCluster {
  id: string;
  canonicalQuestion: string;
  normalizedQuestionIds: string[];
}

export interface IngestionRun {
  id: string;
  sourceNames: string[];
  startedAt: string;
  completedAt?: string;
}

export interface IngestionResult {
  run: IngestionRun;
  observationCount: number;
  normalizedCount: number;
}
