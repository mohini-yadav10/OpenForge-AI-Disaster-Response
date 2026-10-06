import { AgentTask, AgentContext, AgentResult, AgentEvent, AgentEventType } from './types';
import { SkillRouter } from '../skills/SkillRouter';
import { ToolRegistry } from '../tools/ToolRegistry';
import { ModelRouter } from '../providers/ModelRouter';
import { AIProvider, ProviderEvent } from '../provider';

export class AgentRuntime {
  private skillRouter: SkillRouter;
  private toolRegistry: ToolRegistry;
  private modelRouter: ModelRouter;

  constructor(
    skillRouter: SkillRouter,
    toolRegistry: ToolRegistry,
    modelRouter: ModelRouter
  ) {
    this.skillRouter = skillRouter;
    this.toolRegistry = toolRegistry;
    this.modelRouter = modelRouter;
  }

  private createEvent(type: AgentEventType, status: 'pending' | 'success' | 'error', metadata?: Record<string, any>): AgentEvent {
    return {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: Date.now(),
      type,
      status,
      metadata
    };
  }

  async executeTask(task: AgentTask): Promise<AgentResult> {
    const events: AgentEvent[] = [];
    const startTime = Date.now();
    
    events.push(this.createEvent('TASK_RECEIVED', 'success', { input: task.input }));

    try {
      // 1. Skill Routing
      events.push(this.createEvent('SKILL_ROUTING_STARTED', 'pending'));
      const routeResult = await this.skillRouter.route(task);
      const skill = routeResult.skill;
      events.push(this.createEvent('SKILL_SELECTED', 'success', { skill: skill.name }));
      console.log(`[AgentRuntime]\nExecuting skill: ${skill.name}`);

      // 2. Fetch Tools for the Skill
      const allowedTools = skill.tools.map(toolName => {
        const tool = this.toolRegistry.get(toolName);
        if (!tool) throw new Error(`Tool ${toolName} required by skill ${skill.name} is not registered`);
        return tool;
      });

      // 3. Model Routing
      events.push(this.createEvent('MODEL_ROUTING_STARTED', 'pending'));
      const provider = this.modelRouter.route(task);
      events.push(this.createEvent('MODEL_SELECTED', 'success', { provider: provider.name }));

      // 4. Model Execution and Tool Handling
      events.push(this.createEvent('MODEL_STARTED', 'pending'));
      
      task.context = { 
        ...task.context, 
        skillInstructions: skill.instructions,
        skillName: skill.name 
      };
      
      const providerEvents = await provider.executeAgentLoop(task, allowedTools);
      
      let finalOutput = '';
      
      for (const pe of providerEvents) {
        if (pe.type === 'tool_start') {
          events.push(this.createEvent('TOOL_SELECTED', 'success', { tool: pe.tool }));
          events.push(this.createEvent('TOOL_STARTED', 'pending', { tool: pe.tool, input: pe.input }));
        } else if (pe.type === 'tool_end') {
          events.push(this.createEvent('TOOL_COMPLETED', 'success', { tool: pe.tool, result: pe.result }));
        } else if (pe.type === 'message') {
          finalOutput += pe.content;
        } else if (pe.type === 'error') {
          throw new Error(pe.error);
        }
      }

      events.push(this.createEvent('MODEL_COMPLETED', 'success', { outputLength: finalOutput.length }));
      events.push(this.createEvent('RESPONSE_GENERATED', 'success', { content: finalOutput }));
      
      const completeEvent = this.createEvent('TASK_COMPLETED', 'success');
      completeEvent.duration = Date.now() - startTime;
      events.push(completeEvent);

      return {
        taskId: task.id,
        output: finalOutput,
        events
      };
    } catch (error: any) {
      const failEvent = this.createEvent('TASK_FAILED', 'error', { error: error.message });
      failEvent.duration = Date.now() - startTime;
      events.push(failEvent);

      return {
        taskId: task.id,
        output: '',
        events,
        error: error.message
      };
    }
  }
}
