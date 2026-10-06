import { AgentRuntime } from '../agent/AgentRuntime';
import { EvaluationCase, EvaluationResult, EvaluationRun } from './types';
import { AgentTask, AgentEvent } from '../agent/types';

export class EvaluationEngine {
  private runtime: AgentRuntime;

  constructor(runtime: AgentRuntime) {
    this.runtime = runtime;
  }

  async runCase(evalCase: EvaluationCase): Promise<EvaluationResult> {
    const task: AgentTask = {
      id: `eval_task_${evalCase.id}_${Date.now()}`,
      input: evalCase.input
    };

    const startTime = Date.now();
    const result = await this.runtime.executeTask(task);
    const latency = Date.now() - startTime;

    const toolsUsed: string[] = [];
    const skillsUsed: string[] = [];
    const sourcesUsed: string[] = [];

    // Extract trace data
    result.events.forEach((event: AgentEvent) => {
      if (event.type === 'TOOL_SELECTED' && event.metadata?.tool) {
        toolsUsed.push(event.metadata.tool);
      }
      if (event.type === 'SKILL_SELECTED' && event.metadata?.skill) {
        skillsUsed.push(event.metadata.skill);
      }
      if (event.type === 'KNOWLEDGE_RETRIEVED' && event.metadata?.source) {
        sourcesUsed.push(event.metadata.source);
      }
    });

    let passed = true;
    let score = 100;
    const failureReasons: string[] = [];

    // 1. Check if execution errored
    if (result.error) {
      passed = false;
      score = 0;
      failureReasons.push(`Execution error: ${result.error}`);
    } else {
      // 2. Check expected output
      if (evalCase.expectedOutputSubstring) {
        if (!result.output.toLowerCase().includes(evalCase.expectedOutputSubstring.toLowerCase())) {
          passed = false;
          score -= 50;
          failureReasons.push(`Output did not contain expected substring: "${evalCase.expectedOutputSubstring}"`);
        }
      }

      // 3. Check expected tools
      if (evalCase.expectedTools) {
        for (const expectedTool of evalCase.expectedTools) {
          if (!toolsUsed.includes(expectedTool)) {
            passed = false;
            score -= 25;
            failureReasons.push(`Expected tool not used: "${expectedTool}"`);
          }
        }
      }

      // 4. Check expected skills
      if (evalCase.expectedSkills) {
        for (const expectedSkill of evalCase.expectedSkills) {
          if (!skillsUsed.includes(expectedSkill)) {
            passed = false;
            score -= 25;
            failureReasons.push(`Expected skill not used: "${expectedSkill}"`);
          }
        }
      }
    }

    // Bound score
    if (score < 0) score = 0;

    return {
      caseId: evalCase.id,
      passed,
      score,
      latency,
      toolsUsed,
      skillsUsed,
      sourcesUsed,
      failureReason: failureReasons.length > 0 ? failureReasons.join(' | ') : undefined
    };
  }

  async runSuite(cases: EvaluationCase[]): Promise<EvaluationRun> {
    const results: EvaluationResult[] = [];
    
    for (const c of cases) {
      const res = await this.runCase(c);
      results.push(res);
    }

    const passed = results.filter(r => r.passed).length;
    const failed = results.length - passed;
    const averageLatency = results.reduce((acc, curr) => acc + curr.latency, 0) / (results.length || 1);

    return {
      id: `run_${Date.now()}`,
      timestamp: Date.now(),
      results,
      summary: {
        total: results.length,
        passed,
        failed,
        averageLatency
      }
    };
  }
}
