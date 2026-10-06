import { describe, it, expect } from 'vitest';
import { ToolRegistry } from '../tools/ToolRegistry';
import { Tool } from '../tool';

describe('ToolRegistry', () => {
  it('registers tools and checks permissions', () => {
    const registry = new ToolRegistry();
    const dummyTool: Tool = {
      name: 'dummy',
      description: 'A dummy tool',
      category: 'test',
      permissions: ['read'],
      inputSchema: { type: 'object', properties: {} },
      execute: async () => ({})
    };
    
    registry.register(dummyTool);
    
    const retrieved = registry.get('dummy');
    expect(retrieved).toBeDefined();
    
    // Check passing permissions
    expect(registry.verifyPermissions(dummyTool, ['read', 'write'])).toBe(true);
    
    // Check failing permissions (dummy requires 'read', but we only pass 'write')
    expect(registry.verifyPermissions(dummyTool, ['write'])).toBe(false);
  });
});
