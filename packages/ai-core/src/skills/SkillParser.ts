import * as fs from 'fs';
import { Skill } from './types';

export class SkillParser {
  /**
   * Parses a SKILL.md markdown file into a Skill object.
   */
  static parseMarkdown(markdown: string): Skill {
    const extractSection = (heading: string): string => {
      const regex = new RegExp(`##\\s*${heading}\\s*\\n([^#]*)`, 'i');
      const match = markdown.match(regex);
      return match && match[1] ? match[1].trim() : '';
    };

    const extractList = (heading: string): string[] => {
      const text = extractSection(heading);
      if (!text) return [];
      return text.split('\n')
        .map(line => line.replace(/^-\s*/, '').trim())
        .filter(line => line.length > 0);
    };

    const nameMatch = markdown.match(/^#\s*(.+)/);
    const name = nameMatch && nameMatch[1] ? nameMatch[1].trim() : 'Unknown Skill';

    return {
      name,
      description: extractSection('Description'),
      purpose: extractSection('Purpose'),
      when_to_use: extractSection('When to Use'),
      tools: extractList('Tools'),
      instructions: extractSection('Instructions'),
      input: extractSection('Input'),
      output: extractSection('Output'),
      examples: extractList('Examples')
    };
  }

  static parseFile(filePath: string): Skill {
    const content = fs.readFileSync(filePath, 'utf-8');
    return this.parseMarkdown(content);
  }
}
