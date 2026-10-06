import { AIProvider } from '../provider';
import { AgentTask } from '../agent/types';

export class ModelRegistry {
  private providers: Map<string, AIProvider> = new Map();

  register(provider: AIProvider): void {
    if (this.providers.has(provider.name)) {
      throw new Error(`Provider ${provider.name} is already registered.`);
    }
    this.providers.set(provider.name, provider);
  }

  get(name: string): AIProvider | undefined {
    return this.providers.get(name);
  }

  getAll(): AIProvider[] {
    return Array.from(this.providers.values());
  }
}

export class ModelRouter {
  private registry: ModelRegistry;

  constructor(registry: ModelRegistry) {
    this.registry = registry;
  }

  /**
   * Routes the task to the most appropriate AI Provider.
   * Deterministic logic based on task complexity or explicit configurations.
   */
  route(task: AgentTask): AIProvider {
    const providers = this.registry.getAll();
    if (providers.length === 0) {
      throw new Error('No AI Providers registered in the ModelRegistry.');
    }

    const inputLower = task.input.toLowerCase();

    const configuredProviderName = process.env.MODEL_PROVIDER;
    console.log(`[ModelRouter] Environment MODEL_PROVIDER = ${configuredProviderName}`);
    if (configuredProviderName) {
      const configuredProvider = providers.find(p => p.name === configuredProviderName || p.name.toLowerCase() === configuredProviderName.toLowerCase());
      if (configuredProvider) return configuredProvider;
    }

    // Deterministic Routing:
    // If the task requires deep reasoning or math, prefer a "reasoning" or "pro" provider.
    if (inputLower.includes('calculate') || inputLower.includes('analyze') || inputLower.includes('reason')) {
      const advancedProvider = providers.find(p => p.name.toLowerCase().includes('advanced') || p.name.toLowerCase().startsWith('pro') || p.name.toLowerCase().includes('reasoning'));
      if (advancedProvider) {
        return advancedProvider;
      }
    }

    // If the task specifically asks for a demo, prefer the mock provider
    if (inputLower.includes('demo') || inputLower.includes('mock')) {
      const mockProvider = providers.find(p => p.name.toLowerCase().includes('mock'));
      if (mockProvider) {
        return mockProvider;
      }
    }

    // Default to the first available provider
    return providers[0];
  }
}
