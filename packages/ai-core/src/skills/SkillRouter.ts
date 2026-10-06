import { SkillRegistry } from './SkillRegistry';
import { Skill } from './types';
import { AgentTask } from '../agent/types';
import { EmbeddingProvider, MockEmbeddingProvider } from '../rag';
import { cosineSimilarity } from '../utils/math';

export interface RouteResult {
  skill: Skill;
  confidence: number;
  reason: string;
  method: 'deterministic' | 'semantic' | 'fallback';
  latencyMs?: number;
}

export class SkillRouter {
  private registry: SkillRegistry;
  private embedder: EmbeddingProvider;
  private threshold: number;
  private cachedEmbeddings: Map<string, number[]> = new Map();

  constructor(registry: SkillRegistry, embedder?: EmbeddingProvider) {
    this.registry = registry;
    this.embedder = embedder || new MockEmbeddingProvider();
    this.threshold = parseFloat(process.env.SKILL_ROUTING_THRESHOLD || '0.55');
  }

  private async getSkillEmbedding(skill: Skill): Promise<number[]> {
    if (this.cachedEmbeddings.has(skill.name)) {
      return this.cachedEmbeddings.get(skill.name)!;
    }
    const text = [
      skill.name,
      skill.description,
      skill.purpose,
      skill.when_to_use,
      ...(skill.examples || [])
    ].filter(Boolean).join('. ');
    
    const vec = await this.embedder.embedText(text);
    this.cachedEmbeddings.set(skill.name, vec);
    return vec;
  }

  async route(task: AgentTask): Promise<RouteResult> {
    const startTime = Date.now();
    const skills = this.registry.getAll();
    if (skills.length === 0) throw new Error('No skills registered in the SkillRegistry.');

    const inputLower = task.input.toLowerCase();

    // 1. Deterministic Routing (Disaster Priority)
    if (inputLower.includes('flood') || inputLower.includes('earthquake') || inputLower.includes('fire') || inputLower.includes('wildfire') || inputLower.includes('storm') || inputLower.includes('cyclone') || inputLower.includes('rainfall') || inputLower.includes('heavy rain') || inputLower.includes('landslide') || inputLower.includes('weather') || inputLower.includes('disaster') || inputLower.includes('emergency') || inputLower.includes('evacuation') || inputLower.includes('hazard') || inputLower.includes('rescue') || inputLower.includes('warning') || inputLower.includes('risk')) {
      if (inputLower.includes('risk') || inputLower.includes('vulnerability')) {
        const s = skills.find(s => s.name.includes('Risk Assessment'));
        if (s) {
          console.log(`[SkillRouter]\nSelected skill: ${s.name}`);
          return { skill: s, confidence: 1.0, reason: "Risk keywords detected", method: 'deterministic', latencyMs: Date.now() - startTime };
        }
      }
      if (inputLower.includes('plan') || inputLower.includes('authorities should do') || inputLower.includes('respond') || inputLower.includes('guidance')) {
        const s = skills.find(s => s.name.includes('Emergency Response'));
        if (s) {
          console.log(`[SkillRouter]\nSelected skill: ${s.name}`);
          return { skill: s, confidence: 1.0, reason: "Response keywords detected", method: 'deterministic', latencyMs: Date.now() - startTime };
        }
      }
      if (inputLower.includes('analyze') || inputLower.includes('scenario') || inputLower.includes('situation')) {
        const s = skills.find(s => s.name.includes('Disaster Analysis'));
        if (s) {
          console.log(`[SkillRouter]\nSelected skill: ${s.name}`);
          return { skill: s, confidence: 1.0, reason: "Analysis keywords detected", method: 'deterministic', latencyMs: Date.now() - startTime };
        }
      }
      const s = skills.find(s => s.name.includes('Disaster Assistant'));
      if (s) {
        console.log(`[SkillRouter]\nSelected skill: ${s.name}`);
        return { skill: s, confidence: 0.9, reason: "Disaster keywords detected", method: 'deterministic', latencyMs: Date.now() - startTime };
      }
    }

    if (inputLower.includes('calculate') || inputLower.includes('multiply') || inputLower.includes('divide') || inputLower.includes('add') || inputLower.includes('subtract')) {
      const mathSkill = skills.find(s => s.name === 'Math Genius' || s.name === 'math-skill');
      if (mathSkill) {
        console.log(`[SkillRouter]\nSelected skill: ${mathSkill.name}`);
        return { skill: mathSkill, confidence: 1.0, reason: "Math keyword detected", method: 'deterministic', latencyMs: Date.now() - startTime };
      }
    }

    if (inputLower.includes('review code') || inputLower.includes('inspect this code') || inputLower.includes('refactor')) {
      const codeSkill = skills.find(s => s.name === 'Code Review');
      if (codeSkill) {
        console.log(`[SkillRouter]\nSelected skill: ${codeSkill.name}`);
        return { skill: codeSkill, confidence: 1.0, reason: "Code review keyword detected", method: 'deterministic', latencyMs: Date.now() - startTime };
      }
    }

    if (inputLower.includes('document') || inputLower.includes('pdf') || inputLower.includes('file') || inputLower.includes('upload') || inputLower.includes('summarize')) {
      const docSkill = skills.find(s => s.name === 'Document Analysis' || s.name === 'document-skill' || s.tools.includes('document_search'));
      if (docSkill) {
        console.log(`[SkillRouter]\nSelected skill: ${docSkill.name}`);
        return { skill: docSkill, confidence: 1.0, reason: "Document keyword detected", method: 'deterministic', latencyMs: Date.now() - startTime };
      }
    }

    // 2. Semantic Routing
    try {
      const inputVector = await this.embedder.embedText(task.input);
      let bestSkill = skills[0];
      let bestScore = -1;
      let secondBestScore = -1;

      for (const skill of skills) {
        const skillVector = await this.getSkillEmbedding(skill);
        const score = cosineSimilarity(inputVector, skillVector);
        if (score > bestScore) {
          secondBestScore = bestScore;
          bestScore = score;
          bestSkill = skill;
        } else if (score > secondBestScore) {
          secondBestScore = score;
        }
      }

      // Use a margin strategy: If best score exceeds absolute threshold, or if it has a strong margin
      // over the next best candidate (e.g. > 0.40 score and > 0.10 margin)
      const margin = bestScore - secondBestScore;
      if (bestScore >= this.threshold || (bestScore >= 0.40 && margin >= 0.10)) {
        console.log(`[SkillRouter]\nSelected skill: ${bestSkill.name}`);
        return {
          skill: bestSkill,
          confidence: bestScore,
          reason: `High semantic similarity (score: ${bestScore.toFixed(2)}, margin: ${margin.toFixed(2)})`,
          method: 'semantic',
          latencyMs: Date.now() - startTime
        };
      } else {
        console.log(`[Semantic Routing] Best score was ${bestScore.toFixed(2)} (margin ${margin.toFixed(2)}) for ${bestSkill.name}, insufficient confidence.`);
      }
    } catch (e: any) {
      console.warn(`Semantic routing failed: ${e.message}`);
    }

    // 3. Default Fallback
    const fallback = skills.find(s => s.name === 'General Assistant');
    if (fallback) {
      console.log(`[SkillRouter]\nSelected skill: ${fallback.name}`);
      return { skill: fallback, confidence: 0.1, reason: "Fallback to General Assistant", method: 'fallback', latencyMs: Date.now() - startTime };
    }
    
    console.log(`[SkillRouter]\nSelected skill: ${skills[0].name}`);
    return { skill: skills[0], confidence: 0.1, reason: "Fallback to first available skill", method: 'fallback', latencyMs: Date.now() - startTime };
  }
}
