import type { QuestionObservation, NormalizedQuestion, QuestionCluster } from './types.js';

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text: string): Set<string> {
  const normalized = normalizeText(text);
  return new Set(normalized.split(/\s+/).filter((w) => w.length > 2));
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  const intersection = new Set([...a].filter((x) => b.has(x)));
  const union = new Set([...a, ...b]);
  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

function generateId(text: string, companyName: string): string {
  const normalized = normalizeText(text);
  const hash = Buffer.from(`${companyName}:${normalized}`).toString('base64url').slice(0, 16);
  return `q-${hash}`;
}

export interface NormalizationResult {
  normalizedQuestions: NormalizedQuestion[];
  clusters: QuestionCluster[];
  stats: {
    totalObservations: number;
    uniqueQuestions: number;
    clustersCreated: number;
  };
}

export function normalizeQuestions(
  observations: QuestionObservation[],
  similarityThreshold = 0.6
): NormalizationResult {
  const normalizedQuestions: NormalizedQuestion[] = [];
  const clusters: QuestionCluster[] = [];
  const processed = new Set<string>();

  const observationTokens = new Map<string, Set<string>>();
  for (const obs of observations) {
    observationTokens.set(obs.id, tokenize(obs.questionText));
  }

  for (const obs of observations) {
    if (processed.has(obs.id)) continue;

    const obsTokens = observationTokens.get(obs.id)!;
    const clusterObservations: QuestionObservation[] = [obs];
    processed.add(obs.id);

    for (const other of observations) {
      if (processed.has(other.id)) continue;

      const otherTokens = observationTokens.get(other.id)!;
      const similarity = jaccardSimilarity(obsTokens, otherTokens);

      if (similarity >= similarityThreshold) {
        clusterObservations.push(other);
        processed.add(other.id);
      }
    }

    const canonicalQuestion = obs.questionText;
    const normalizedId = generateId(canonicalQuestion, obs.companyName);

    const normalizedQuestion: NormalizedQuestion = {
      id: normalizedId,
      canonicalQuestion,
      companyName: obs.companyName,
      roleTitle: obs.roleTitle,
      observations: clusterObservations,
    };

    normalizedQuestions.push(normalizedQuestion);

    const clusterId = `cluster-${normalizedId}`;
    clusters.push({
      id: clusterId,
      canonicalQuestion,
      normalizedQuestionIds: [normalizedId],
    });
  }

  return {
    normalizedQuestions,
    clusters,
    stats: {
      totalObservations: observations.length,
      uniqueQuestions: normalizedQuestions.length,
      clustersCreated: clusters.length,
    },
  };
}