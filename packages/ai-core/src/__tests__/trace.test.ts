import { describe, it, expect } from 'vitest';
import { ExecutionTrace } from '../trace/ExecutionTrace';

describe('ExecutionTrace', () => {
  it('records events without exposing chain of thought', () => {
    const trace = new ExecutionTrace('task_123');
    
    const event1 = trace.addEvent('TASK_RECEIVED', 'success', { input: 'Calculate 5+5' });
    const event2 = trace.addEvent('TOOL_STARTED', 'pending', { tool: 'calculator' });
    
    const events = trace.getEvents();
    
    expect(events).toHaveLength(2);
    expect(events[0].type).toBe('TASK_RECEIVED');
    expect(events[0].id).toBeDefined();
    expect(events[1].type).toBe('TOOL_STARTED');
    expect(events[1].status).toBe('pending');
    
    const taskEvents = trace.getEventsByType('TASK_RECEIVED');
    expect(taskEvents).toHaveLength(1);
    expect(taskEvents[0].id).toBe(event1.id);
  });
});
