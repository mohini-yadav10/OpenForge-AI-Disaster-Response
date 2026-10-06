import { Skill } from './types';

export class SkillRegistry {
  private skills: Map<string, Skill> = new Map();

  register(skill: Skill): void {
    if (this.skills.has(skill.name)) {
      throw new Error(`Skill ${skill.name} is already registered.`);
    }
    this.skills.set(skill.name, skill);
  }

  get(name: string): Skill | undefined {
    return this.skills.get(name);
  }

  getAll(): Skill[] {
    return Array.from(this.skills.values());
  }

  remove(name: string): boolean {
    return this.skills.delete(name);
  }
}
