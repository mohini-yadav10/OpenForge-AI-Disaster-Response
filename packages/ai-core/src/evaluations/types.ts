export interface EvaluationCase {
  id: string;
  name: string;
  input: string;
  expectedOutputSubstring?: string;
  expectedTools?: string[];
  expectedSkills?: string[];
}

export interface EvaluationResult {
  caseId: string;
  passed: boolean;
  score: number;
  latency: number;
  toolsUsed: string[];
  skillsUsed: string[];
  sourcesUsed: string[];
  failureReason?: string;
}

export interface EvaluationRun {
  id: string;
  timestamp: number;
  results: EvaluationResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    averageLatency: number;
  };
}
