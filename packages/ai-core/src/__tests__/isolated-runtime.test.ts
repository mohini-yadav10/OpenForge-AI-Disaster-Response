import { describe, it, expect, beforeAll } from 'vitest';
import { AgentRuntime } from '../agent/AgentRuntime';
import { SkillRouter } from '../skills/SkillRouter';
import { SkillRegistry } from '../skills/SkillRegistry';
import { ToolRegistry } from '../tools/ToolRegistry';
import { ModelRouter, ModelRegistry } from '../providers/ModelRouter';
import { OpenWeightProvider } from '../provider';
import { LocalEmbeddingProvider } from '../rag';
import { CalculatorTool } from '../tool';

describe('AgentRuntime Isolated', () => {
  let runtime: AgentRuntime;

  beforeAll(() => {
    const sReg = new SkillRegistry();
    sReg.register({
      name: 'Math Genius',
      description: 'Math',
      purpose: 'Math',
      when_to_use: 'calculate',
      tools: ['calculator'],
      instructions: '', input: '', output: '', examples: []
    });

    const tReg = new ToolRegistry();
    tReg.register(new CalculatorTool());

    const mReg = new ModelRegistry();
    mReg.register(new OpenWeightProvider());

    const embed = new LocalEmbeddingProvider('Xenova/all-MiniLM-L6-v2');
    const skillRouter = new SkillRouter(sReg, embed);
    const modelRouter = new ModelRouter(mReg);

    runtime = new AgentRuntime(skillRouter, tReg, modelRouter);
  });

  it('routes correctly and fails honestly at LLM generation', async () => {
    const res = await runtime.executeTask({ id: 'test1', input: 'Calculate 245 * 18' });
    
    // Skill selection succeeded
    expect(res.events.some(e => e.type === 'SKILL_SELECTED' && e.metadata?.skill === 'Math Genius')).toBe(true);
    
    // Tool execution succeeded
    expect(res.events.some(e => e.type === 'TOOL_COMPLETED' && e.metadata?.result?.result === 4410)).toBe(true);
    
    // Task failed due to offline Ollama
    expect(res.events.some(e => e.type === 'TASK_FAILED' && e.metadata?.error?.includes('fetch failed'))).toBe(true);
    expect(res.error).toMatch(/fetch failed/);
  }, 30000);
});
