import { describe, it, expect } from 'vitest';
import { EvaluationEngine } from '../evaluations/EvaluationEngine';
import { AgentRuntime } from '../agent/AgentRuntime';
import { SkillRegistry } from '../skills/SkillRegistry';
import { SkillRouter } from '../skills/SkillRouter';
import { ToolRegistry } from '../tools/ToolRegistry';
import { CalculatorTool } from '../tool';
import { ModelRegistry, ModelRouter } from '../providers/ModelRouter';
import { MockProvider } from '../provider';
import { EvaluationCase } from '../evaluations/types';

describe('EvaluationEngine', () => {
  const createTestRuntime = () => {
    const skillRegistry = new SkillRegistry();
    skillRegistry.register({
      name: 'General Assistant',
      description: 'Fallback skill',
      purpose: 'General tasks',
      when_to_use: 'general',
      tools: [],
      instructions: '',
      input: '',
      output: '',
      examples: []
    });

    const toolRegistry = new ToolRegistry();
    const modelRegistry = new ModelRegistry();
    modelRegistry.register(new MockProvider());

    const skillRouter = new SkillRouter(skillRegistry);
    const modelRouter = new ModelRouter(modelRegistry);
    return new AgentRuntime(skillRouter, toolRegistry, modelRouter);
  };

  it('evaluates cases correctly using the underlying AgentRuntime', async () => {
    const runtime = createTestRuntime();
    const engine = new EvaluationEngine(runtime);

    const testCase: EvaluationCase = {
      id: 'eval_1',
      name: 'Basic Task Test',
      input: 'hello',
      expectedOutputSubstring: 'Demo Assistant',
      expectedSkills: ['General Assistant']
    };

    const result = await engine.runCase(testCase);

    expect(result.caseId).toBe('eval_1');
    expect(result.passed).toBe(true);
    expect(result.score).toBe(100);
    expect(result.skillsUsed).toContain('General Assistant');
  });

  it('fails if expected output is missing', async () => {
    const runtime = createTestRuntime();
    const engine = new EvaluationEngine(runtime);

    const testCase: EvaluationCase = {
      id: 'eval_2',
      name: 'Missing Output',
      input: 'hello',
      expectedOutputSubstring: 'never going to match this'
    };

    const result = await engine.runCase(testCase);

    expect(result.passed).toBe(false);
    expect(result.score).toBe(50);
    expect(result.failureReason).toContain('Output did not contain expected substring');
  });
});
