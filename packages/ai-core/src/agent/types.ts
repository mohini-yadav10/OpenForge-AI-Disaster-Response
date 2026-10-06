export type AgentEventType = 
  | 'TASK_RECEIVED'
  | 'SKILL_ROUTING_STARTED'
  | 'SKILL_SELECTED'
  | 'KNOWLEDGE_SEARCH_STARTED'
  | 'KNOWLEDGE_RETRIEVED'
  | 'TOOL_SELECTED'
  | 'TOOL_STARTED'
  | 'TOOL_COMPLETED'
  | 'TOOL_FAILED'
  | 'MODEL_ROUTING_STARTED'
  | 'MODEL_SELECTED'
  | 'MODEL_STARTED'
  | 'MODEL_COMPLETED'
  | 'RESPONSE_GENERATED'
  | 'TASK_COMPLETED'
  | 'TASK_FAILED';

export interface AgentEvent {
  id: string;
  timestamp: number;
  type: AgentEventType;
  status: 'pending' | 'success' | 'error';
  duration?: number;
  metadata?: Record<string, any>;
}

export interface AgentTask {
  id: string;
  input: string;
  history?: { role: string; content: string }[];
  context?: Record<string, any>;
}

export interface AgentStep {
  id: string;
  action: string;
  result?: any;
}

export interface AgentContext {
  task: AgentTask;
  history: any[];
  steps: AgentStep[];
  knowledge: any[];
}

export interface AgentResult {
  taskId: string;
  output: string;
  events: AgentEvent[];
  error?: string;
}
