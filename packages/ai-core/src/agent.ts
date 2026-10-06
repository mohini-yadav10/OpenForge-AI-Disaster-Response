import { AIProvider, ProviderEvent } from "./provider";
import { Tool } from "./tool";

export interface AgentConfig {
  name: string;
  systemInstructions: string;
  provider: AIProvider;
  tools: Tool[];
}

export class Agent {
  config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  async run(input: string): Promise<string> {
    return this.config.provider.generateText(input);
  }

  async runWithEvents(input: string): Promise<ProviderEvent[]> {
    if (this.config.provider.executeAgentLoop) {
       return this.config.provider.executeAgentLoop(input, this.config.tools);
    }
    // Fallback if provider doesn't support structured events natively
    const response = await this.run(input);
    return [{ type: 'message', content: response }];
  }
}
