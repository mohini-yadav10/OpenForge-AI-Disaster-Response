import { describe, it, expect, beforeAll } from 'vitest';
import { SkillRouter } from '../skills/SkillRouter';
import { SkillRegistry } from '../skills/SkillRegistry';
import { LocalEmbeddingProvider } from '../rag';
import { AgentTask } from '../agent/types';

describe('Hybrid Skill Routing', () => {
  let router: SkillRouter;

  beforeAll(() => {
    process.env.SKILL_ROUTING_THRESHOLD = '0.55';
    const registry = new SkillRegistry();
    // Register mock skills that mirror the real ones for testing
    registry.register({
      name: 'Math Genius',
      description: 'Solves complex calculations.',
      purpose: 'Handle math and arithmetic.',
      when_to_use: 'calculate, math, add, subtract, multiply, total of these numbers, arithmetic',
      tools: ['calculator'],
      instructions: '', input: '', output: '', examples: [
        'I need you to find the total of these numbers.'
      ]
    });
    
    registry.register({
      name: 'Document Analysis',
      description: 'Answers questions based on uploaded documents.',
      purpose: 'Analyze documents and extract relevant information',
      when_to_use: 'document, analyze, search, summarize the important information',
      tools: ['document_search'],
      instructions: '', input: '', output: '', examples: [
        "summarize this document",
        "find important information in this file",
        "analyze the project documentation"
      ]
    });

    registry.register({
      name: 'Code Review',
      description: 'Reviews code for bugs and quality.',
      purpose: 'Inspect code and find bugs',
      when_to_use: 'review code, code quality, bug, refactor, inspect this code and identify possible bugs',
      tools: [],
      instructions: '', input: '', output: '', examples: []
    });

    registry.register({
      name: 'Deep Research',
      description: 'Investigate topics and compare sources.',
      purpose: 'Perform deep research on a topic, search for information, and compile a report',
      when_to_use: 'research, investigate, find information, investigate this topic and compare different sources',
      tools: [],
      instructions: '', input: '', output: '', examples: [
        'Investigate this topic and compare different sources.'
      ]
    });

    registry.register({
      name: 'General Assistant',
      description: 'Handles generic conversational queries.',
      purpose: 'Fallback conversational agent',
      when_to_use: 'general, hello, how are you',
      tools: [],
      instructions: '', input: '', output: '', examples: []
    });

    const embedder = new LocalEmbeddingProvider('Xenova/all-MiniLM-L6-v2');
    router = new SkillRouter(registry, embedder);
  });

  const runTest = async (input: string, expectedSkill: string) => {
    const task: AgentTask = { id: 'test', input };
    const result = await router.route(task);
    
    console.log(`\n--- Routing Test ---`);
    console.log(`Input: "${input}"`);
    console.log(`Selected Skill: ${result.skill.name}`);
    console.log(`Method: ${result.method}`);
    console.log(`Confidence: ${result.confidence.toFixed(2)}`);
    console.log(`Latency: ${result.latencyMs}ms`);
    
    expect(result.skill.name).toBe(expectedSkill);
  };

  it('TEST 1: Deterministic Math', async () => {
    await runTest('Calculate 245 × 18', 'Math Genius');
  }, 300000);

  it('TEST 2: Semantic Math', async () => {
    await runTest('I need you to find the total of these numbers.', 'Math Genius');
  }, 300000);

  it('TEST 3: Semantic Code Review', async () => {
    await runTest('Please inspect this code and identify possible bugs.', 'Code Review');
  }, 300000);

  it('TEST 4: Semantic Document Analysis', async () => {
    await runTest('Summarize the important information from this document.', 'Document Analysis');
  }, 300000);

  it('TEST 5: Semantic Deep Research', async () => {
    await runTest('Investigate this topic and compare different sources.', 'Deep Research');
  }, 300000);
});
