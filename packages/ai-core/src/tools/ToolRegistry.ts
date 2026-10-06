import { Tool, ToolPermission } from '../tool';

export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  register(tool: Tool): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool ${tool.name} is already registered.`);
    }
    this.tools.set(tool.name, tool);
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  getAll(): Tool[] {
    return Array.from(this.tools.values());
  }

  remove(name: string): boolean {
    return this.tools.delete(name);
  }

  verifyPermissions(tool: Tool, allowedPermissions: ToolPermission[]): boolean {
    for (const permission of (tool.permissions || [])) {
      if (!allowedPermissions.includes(permission)) {
        return false;
      }
    }
    return true;
  }
}
