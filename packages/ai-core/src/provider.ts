import { AgentEvent } from './agent/types';

export interface ProviderEvent {
  type: 'thinking' | 'tool_start' | 'tool_end' | 'message' | 'error';
  tool?: string;
  input?: any;
  result?: any;
  content?: string;
  error?: string;
}

export interface AIProvider {
  name: string;
  generateText(prompt: string, options?: any): Promise<string>;
  generateChat(messages: any[], options?: any): Promise<string>;
  executeAgentLoop(task: any, tools: any[]): Promise<ProviderEvent[]>;
}

export class GeminiProvider implements AIProvider {
  name = "gemini";
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async callGemini(prompt: string): Promise<string> {
    if (!this.apiKey) throw new Error("Server configuration error: GOOGLE_API_KEY is missing. Please configure it in the backend.");
    
    // We are simulating Gemma 4 integration through the Gemini API endpoint
    // Standard Gemini REST API URL
    const model = process.env.MODEL_NAME || 'gemma-4-31b-it';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API Error (${response.status}): ${errText}`);
      }
      
      const data = await response.json();
      if (data.candidates && data.candidates.length > 0) {
        return data.candidates[0].content.parts[0].text;
      }
      throw new Error("No candidates returned from Gemini.");
    } catch (e: any) {
      console.error("[GeminiProvider Error]", e);
      throw new Error(`Gemma 4 accessed through Gemini API failed: ${e.message}`);
    }
  }

  async generateText(prompt: string): Promise<string> {
    console.log(`[Provider]\nProvider: ${this.name}`);
    console.log(`[Provider]\nModel: ${process.env.MODEL_NAME || 'gemma-4-31b-it'}`);
    console.log(`[Provider]\nInference started`);
    const result = await this.callGemini(prompt);
    console.log(`[Provider]\nInference completed`);
    return result;
  }

  async generateChat(messages: any[]): Promise<string> {
    const prompt = messages.map(m => `${m.role === 'user' ? 'User' : 'Agent'}: ${m.content}`).join('\n') + "\nAgent:";
    return this.callGemini(prompt);
  }

  async executeAgentLoop(task: any, tools: any[]): Promise<ProviderEvent[]> {
    const input = task.input;
    const historyText = (task.history || []).map((m: any) => `${m.role === 'user' ? 'User' : 'Agent'}: ${m.content}`).join('\n');
    const conversationContext = historyText ? historyText + `\nUser: ${input}` : `User: ${input}`;
    const events: ProviderEvent[] = [{ type: 'thinking' }];
    
    // Basic deterministic tool execution similar to OpenWeightProvider for Demo consistency
    const lowerInput = input.toLowerCase();
    
    if (tools.find(t => t.name === 'calculator') && lowerInput.match(/[0-9]+.*[\+\-\*\/].*[0-9]+/)) {
      const tool = tools.find(t => t.name === 'calculator')!;
      events.push({ type: 'tool_start', tool: 'calculator', input: { expression: input } });
      const result = await tool.execute({ expression: input });
      events.push({ type: 'tool_end', tool: 'calculator', result });
      
      try {
        const finalAns = await this.callGemini(
          `You are a mathematical assistant. State the final answer based on the calculation result provided.\nQuestion: ${input}\nCalculator Result: ${result.result || result.error}`
        );
        events.push({ type: 'message', content: finalAns });
      } catch (e: any) {
        events.push({ type: 'error', error: e.message });
      }
      return events;
    }

    try {
      const systemPrompt = task.context?.skillInstructions || "You are a helpful AI assistant focusing on Disaster Intelligence and Emergency Response.";
      const prompt = `${systemPrompt}\nContext:\n${conversationContext}\nAgent:`;
      
      console.log(`[Provider]\nProvider: gemini`);
      console.log(`[Provider]\nModel: ${process.env.MODEL_NAME || 'gemma-4-31b-it'}`);
      console.log(`[Provider]\nInference started`);
      
      const ans = await this.callGemini(prompt);
      
      console.log(`[Provider]\nInference completed`);
      
      events.push({ type: 'message', content: ans });
    } catch (e: any) {
      events.push({ type: 'error', error: e.message });
    }
    return events;
  }
}


export interface AIProvider {
  name: string;
  generateText(prompt: string, options?: any): Promise<string>;
  generateChat(messages: any[], options?: any): Promise<string>;
  executeAgentLoop(task: any, tools: any[]): Promise<ProviderEvent[]>;
}

export class MockProvider implements AIProvider {
  name = "MockProvider";

  async generateText(prompt: string): Promise<string> {
    return `[Mock Response] I received your prompt: "${prompt.substring(0, 50)}..."`;
  }

  async generateChat(messages: any[]): Promise<string> {
    return `[Mock Chat] Acknowledged.`;
  }

  async executeAgentLoop(task: any, tools: any[]): Promise<ProviderEvent[]> {
    const input = task.input;
    const events: ProviderEvent[] = [{ type: 'thinking' }];
    const lowerInput = input.toLowerCase();
    
    // Simulate Image Generation Rejection
    if (lowerInput.includes('image') && lowerInput.includes('generate')) {
      events.push({ type: 'error', error: "Image generation is not enabled in Demo Mode. Connect an image-capable provider to enable this feature." });
      return events;
    }

    // Simulate Calculator Tool
    if (lowerInput.match(/[0-9]+.*[\+\-\*\/].*[0-9]+/)) {
      const tool = tools.find(t => t.name === 'calculator');
      if (tool) {
        events.push({ type: 'tool_start', tool: 'calculator', input: { expression: input } });
        const result = await tool.execute({ expression: input });
        events.push({ type: 'tool_end', tool: 'calculator', result });
        events.push({ type: 'message', content: `Based on your request, the result is: **${result.result || result.error}**` });
        return events;
      }
    }

    // Simulate Document Search Tool
    if (lowerInput.includes('document') || lowerInput.includes('search') || lowerInput.includes('knowledge')) {
      const tool = tools.find(t => t.name === 'document_search');
      if (tool) {
        events.push({ type: 'tool_start', tool: 'document_search', input: { query: input } });
        const result = await tool.execute({ query: input });
        events.push({ type: 'tool_end', tool: 'document_search', result });
        events.push({ type: 'message', content: `I found the following relevant information in your documents:\n\n` + result.results.map((r: any) => `- **${r.title}**: ${r.snippet}`).join('\n') });
        return events;
      }
    }

    // Default response
    events.push({ type: 'message', content: `I'm your OpenForge AI Demo Assistant. I understand you said: "${input}".\n\nTry asking me to calculate something or search your knowledge base!` });
    return events;
  }
}

export class OpenWeightProvider implements AIProvider {
  name = "OpenWeightProvider";
  
  private async callLLM(system: string, user: string): Promise<string> {
    const baseUrl = process.env.MODEL_BASE_URL || 'http://localhost:11434/api';
    const model = process.env.MODEL_NAME || 'llama3';
    
    try {
      const response = await fetch(`${baseUrl}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: `${system}\n\n${user}\nAgent:`,
          stream: false
        })
      });
      if (!response.ok) {
        const errText = await response.text();
        if (response.status === 404 && errText.includes('not found')) {
          throw new Error('AI model is unavailable. Configure an available model/provider.');
        }
        throw new Error(`LLM API returned ${response.status}: ${errText}`);
      }
      const data = await response.json();
      return data.response;
    } catch (e: any) {
      if (e.message.includes('not installed') || e.message.includes('unavailable')) {
        throw e;
      }
      if (e.message.includes('fetch failed') || e.message.includes('ECONNREFUSED') || e.cause) {
        console.error(`[Developer Console] Raw Provider Error:`, e);
        throw new Error('AI model is unavailable. Configure an available model/provider.');
      }
      throw new Error(e.message.startsWith('LLM API returned') ? e.message : `Inference Failed: ${e.message}`);
    }
  }

  async generateText(prompt: string): Promise<string> {
    return this.callLLM("You are a helpful AI assistant.", prompt);
  }

  async generateChat(messages: any[]): Promise<string> {
    return this.callLLM("You are a helpful AI assistant.", messages.map(m => m.content).join('\n'));
  }

  async executeAgentLoop(task: any, tools: any[]): Promise<ProviderEvent[]> {
    const input = task.input;
    const historyText = (task.history || []).map((m: any) => `${m.role === 'user' ? 'User' : 'Agent'}: ${m.content}`).join('\n');
    const conversationContext = historyText ? historyText + `\nUser: ${input}` : `User: ${input}`;
    const events: ProviderEvent[] = [{ type: 'thinking' }];
    const lowerInput = input.toLowerCase();
    
    // In a pure implementation, we would use Ollama's experimental tool calling or prompt engineering.
    // For this demonstration, we detect the need for tools deterministically to guarantee reliable tool use,
    // but we use the REAL LLM to generate the final grounded response.
    
    if (tools.find(t => t.name === 'calculator') && lowerInput.match(/[0-9]+.*[\+\-\*\/].*[0-9]+/)) {
      const tool = tools.find(t => t.name === 'calculator')!;
      events.push({ type: 'tool_start', tool: 'calculator', input: { expression: input } });
      const result = await tool.execute({ expression: input });
      events.push({ type: 'tool_end', tool: 'calculator', result });
      
      try {
        const finalAns = await this.callLLM(
          "You are a mathematical assistant. State the final answer based on the calculation result provided.",
          `Question: ${input}\nCalculator Result: ${result.result || result.error}`
        );
        events.push({ type: 'message', content: finalAns });
      } catch (e: any) {
        events.push({ type: 'error', error: e.message });
      }
      return events;
    }

    const docKeywords = ['upload', 'document', 'pdf', 'file', 'report', 'context', 'chapter', 'summarize'];
    const requiresDocument = docKeywords.some(kw => lowerInput.includes(kw));

    if (tools.find(t => t.name === 'document_search') && requiresDocument) {
      const tool = tools.find(t => t.name === 'document_search')!;
      events.push({ type: 'tool_start', tool: 'document_search', input: { query: input } });
      const result = await tool.execute({ query: input });
      events.push({ type: 'tool_end', tool: 'document_search', result });
      
      const context = result.results ? result.results.map((r:any) => r.snippet).join('\n') : 'No results found.';
      try {
        const finalAns = await this.callLLM(
          "You are an assistant. Answer the user's question STRICTLY based on the provided document context. If the context does not contain the answer, say you don't know.",
          `Context:\n${context}\n\nQuestion: ${input}`
        );
        events.push({ type: 'message', content: finalAns });
      } catch (e: any) {
        events.push({ type: 'error', error: e.message });
      }
      return events;
    }

    // Default general response without tools
    try {
      const systemPrompt = task.context?.skillInstructions || "You are a helpful AI assistant.";
      
      console.log(`[Provider]\nProvider: ${this.name}`);
      console.log(`[Provider]\nModel: ${process.env.MODEL_NAME || 'llama3'}`);
      console.log(`[Provider]\nInference started`);
      
      const ans = await this.callLLM(systemPrompt, conversationContext);
      
      console.log(`[Provider]\nInference completed`);
      
      events.push({ type: 'message', content: ans });
    } catch (e: any) {
      events.push({ type: 'error', error: e.message });
    }
    return events;
  }
}
