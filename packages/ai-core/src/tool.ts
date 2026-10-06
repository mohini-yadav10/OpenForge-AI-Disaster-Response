export type ToolPermission = 'read' | 'write' | 'network' | 'filesystem' | 'external';

export interface ToolInputSchema {
  type: string;
  properties: Record<string, any>;
  required?: string[];
}

export interface Tool {
  name: string;
  description: string;
  category: string;
  permissions: ToolPermission[];
  inputSchema: ToolInputSchema;
  execute(args: any): Promise<any>;
}

export class CalculatorTool implements Tool {
  name = "calculator";
  description = "Evaluates mathematical expressions";
  category: string;
  permissions: ToolPermission[];
  inputSchema = {
    type: "object",
    properties: {
      expression: { type: "string", description: "The mathematical expression to evaluate" }
    },
    required: ["expression"]
  };

  constructor() {
    this.category = "math";
    this.permissions = ['read'];
  }

  async execute(args: { expression: string }): Promise<any> {
    try {
      console.log("DEBUG: CalculatorTool execute called with:", args.expression);
      const isMatch = /^[0-9+\-*/().%\s]+$/.test(args.expression);
      console.log("DEBUG: Regex match result:", isMatch);
      if (!isMatch) {
        throw new Error("Invalid characters in expression");
      }
      const expr = args.expression.replace(/\s+/g, '');
      const tokens = expr.match(/(?:(?:\d*\.\d+|\d+)|[+\-*/()%])/g);
      if (!tokens) throw new Error("Invalid expression");

      class Parser {
        private pos = 0;
        constructor(private tokens: string[]) {}
        parse(): number {
          const result = this.parseExpression();
          if (this.pos < this.tokens.length) throw new Error("Unexpected characters at end of expression");
          return result;
        }
        private parseExpression(): number {
          let left = this.parseTerm();
          while (this.pos < this.tokens.length) {
            const op = this.tokens[this.pos];
            if (op === '+') { this.pos++; left += this.parseTerm(); }
            else if (op === '-') { this.pos++; left -= this.parseTerm(); }
            else break;
          }
          return left;
        }
        private parseTerm(): number {
          let left = this.parseFactor();
          while (this.pos < this.tokens.length) {
            const op = this.tokens[this.pos];
            if (op === '*') { this.pos++; left *= this.parseFactor(); }
            else if (op === '/') { this.pos++; left /= this.parseFactor(); }
            else if (op === '%') { this.pos++; left %= this.parseFactor(); }
            else break;
          }
          return left;
        }
        private parseFactor(): number {
          if (this.pos >= this.tokens.length) throw new Error("Unexpected end of expression");
          const token = this.tokens[this.pos++];
          if (token === '(') {
            const val = this.parseExpression();
            if (this.tokens[this.pos++] !== ')') throw new Error("Expected closing parenthesis");
            return val;
          }
          if (token === '-') return -this.parseFactor();
          if (token === '+') return this.parseFactor();
          const val = parseFloat(token);
          if (isNaN(val)) throw new Error(`Expected number, got ${token}`);
          return val;
        }
      }

      const result = new Parser(tokens).parse();
      return { result: result.toString() };
    } catch (e: any) {
      return { error: `Failed to evaluate expression: ${e.message}` };
    }
  }
}

export class DocumentSearchTool implements Tool {
  name = "document_search";
  description = "Searches the knowledge base for relevant documents";
  category: string;
  permissions: ToolPermission[];
  inputSchema = {
    type: "object",
    properties: {
      query: { type: "string", description: "The search query" }
    },
    required: ["query"]
  };

  private vectorStore: any;
  private embeddingProvider: any;

  constructor(vectorStore?: any, embeddingProvider?: any) {
    this.category = "research";
    this.permissions = ['read'];
    this.vectorStore = vectorStore;
    this.embeddingProvider = embeddingProvider;
  }

  async execute(args: { query: string }): Promise<any> {
    if (!this.vectorStore || !this.embeddingProvider) {
      return { error: "Vector store or embedding provider not configured." };
    }
    try {
      const queryVector = (await this.embeddingProvider.embedBatch([args.query]))[0];
      const results = await this.vectorStore.search(queryVector, 3);
      console.log(`[RAG]\nRetrieved: ${results.length} documents`);
      return { 
        results: results.map((r: any) => ({
          title: r.chunk.documentId,
          snippet: r.chunk.text
        }))
      };
    } catch (e: any) {
      return { error: `Search failed: ${e.message}` };
    }
  }
}

export class DateTimeTool implements Tool {
  name = "date_time";
  description = "Gets the current date and time";
  category: string;
  permissions: ToolPermission[];
  inputSchema = { type: "object", properties: {} };

  constructor() {
    this.category = "utility";
    this.permissions = ['read'];
  }

  async execute(): Promise<any> {
    return { datetime: new Date().toISOString() };
  }
}

export class DisasterDataTool implements Tool {
  name = "disaster_data";
  description = "Fetches active disaster scenarios and environmental data for a given region.";
  category = "data";
  permissions: ToolPermission[] = ["external"];
  inputSchema = {
    type: "object",
    properties: {
      location: { type: "string", description: "Location to check" }
    }
  };
  
  async execute(input: any): Promise<any> {
    return {
      status: "DEMO / SIMULATED",
      event: {
        type: "Flood",
        location: input.location || "Coastal Region Alpha",
        rainfall_mm: 145,
        waterLevel_m: 4.2,
        historicalRisk: "High",
        affectedPopulation: 25000,
        severity: "Critical",
        timestamp: new Date().toISOString()
      }
    };
  }
}

export class RiskCalculatorTool implements Tool {
  name = "risk_calculator";
  description = "Calculates disaster risk based on environmental indicators.";
  category = "analysis";
  permissions: ToolPermission[] = ["read"];
  inputSchema = {
    type: "object",
    properties: {
      type: { type: "string" },
      severity: { type: "string" },
      population: { type: "number" }
    }
  };
  
  async execute(input: any): Promise<any> {
    let severityScore = 0;
    if (input.severity === "Critical") severityScore = 40;
    else if (input.severity === "High") severityScore = 30;
    else severityScore = 15;
    
    let densityScore = input.population > 10000 ? 25 : 10;
    let infrastructureScore = 20;
    let exposureScore = 15;
    
    let score = severityScore + densityScore + infrastructureScore + exposureScore;
    let riskLevel = "MODERATE";
    
    if (score >= 90) riskLevel = "CRITICAL";
    else if (score >= 70) riskLevel = "HIGH";
    else if (score >= 50) riskLevel = "MODERATE";
    else riskLevel = "LOW";
    
    const formattedExplanation = `DEMO / EXPLAINABLE RISK SCORE

Event severity       +${severityScore}
Incident density     +${densityScore}
Infrastructure risk  +${infrastructureScore}
Area exposure        +${exposureScore}

TOTAL:
${score}

RISK:
${riskLevel}

Why is this area ${riskLevel.toLowerCase()} risk?
This area is assessed as ${riskLevel} risk primarily due to the ${input.severity?.toLowerCase() || 'current'} severity of the event and the density of the affected population (${input.population || 'unknown'} people).`;

    return {
      status: "DEMO / SIMULATED",
      calculation: "Demo Risk Assessment",
      inputs: input,
      score,
      riskLevel,
      explanation: formattedExplanation,
      rawOutput: formattedExplanation
    };
  }
}
