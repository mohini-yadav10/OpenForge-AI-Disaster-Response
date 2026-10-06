import { describe, it, expect } from 'vitest';
import { SkillRegistry } from '../skills/SkillRegistry';
import { SkillRouter } from '../skills/SkillRouter';

describe('SkillRouter & Registry', () => {
  it('registers and routes to appropriate skills', async () => {
    const registry = new SkillRegistry();
    
    registry.register({
      name: 'math-skill',
      description: 'Solves math problems',
      purpose: 'calculation',
      when_to_use: 'calculate, math, add, multiply',
      tools: ['calculator'],
      instructions: 'Use the calculator.',
      input: 'math expression',
      output: 'result',
      examples: []
    });

    registry.register({
      name: 'document-skill',
      description: 'Reads documents',
      purpose: 'research',
      when_to_use: 'document, read, summarize',
      tools: ['document_search'],
      instructions: 'Use the document search.',
      input: 'query',
      output: 'summary',
      examples: []
    });

    const router = new SkillRouter(registry);

    // Test routing to math skill
    const result1 = await router.route({ id: '1', input: 'Please calculate 2 + 2' });
    expect(result1.skill.name).toBe('math-skill');
    expect(result1.confidence).toBeGreaterThan(0.8);

    // Test routing to document skill
    const result2 = await router.route({ id: '2', input: 'Can you summarize this document?' });
    expect(result2.skill.name).toBe('document-skill');
    
    // Test fallback routing
    const result3 = await router.route({ id: '3', input: 'Say hello to the world' });
    expect(result3.skill.name).toBe('math-skill'); // defaults to first registered
    expect(result3.confidence).toBeLessThan(0.5);
  });
});

import { SkillParser } from '../skills/SkillParser';
import * as path from 'path';

describe('SkillParser', () => {
  it('parses a SKILL.md file correctly', () => {
    const docSkillPath = path.resolve(__dirname, '../../skills/document-analysis/SKILL.md');
    const skill = SkillParser.parseFile(docSkillPath);
    
    expect(skill.name).toBe('Document Analysis');
    expect(skill.purpose).toContain('Information extraction');
    expect(skill.tools).toContain('document_search');
    expect(skill.tools).toContain('calculator');
    expect(skill.examples.length).toBeGreaterThan(0);
  });
});
