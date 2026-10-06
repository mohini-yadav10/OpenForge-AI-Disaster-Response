import { AgentEvent, AgentEventType } from '../agent/types';

export class ExecutionTrace {
  public taskId: string;
  private events: AgentEvent[] = [];

  constructor(taskId: string) {
    this.taskId = taskId;
  }

  addEvent(
    type: AgentEventType, 
    status: 'pending' | 'success' | 'error', 
    metadata?: Record<string, any>, 
    duration?: number
  ): AgentEvent {
    // Note: Do NOT store or expose private chain-of-thought in metadata.
    // Ensure metadata is sanitized before being passed here.
    const event: AgentEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: Date.now(),
      type,
      status,
      duration,
      metadata
    };
    
    this.events.push(event);
    return event;
  }

  getEvents(): AgentEvent[] {
    return [...this.events];
  }

  getEventsByType(type: AgentEventType): AgentEvent[] {
    return this.events.filter(e => e.type === type);
  }

  clear(): void {
    this.events = [];
  }
}
