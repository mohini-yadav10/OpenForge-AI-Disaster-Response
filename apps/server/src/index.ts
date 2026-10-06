import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { 
  AgentRuntime, MockProvider, OpenWeightProvider, CalculatorTool, DocumentSearchTool, DateTimeTool,
  DisasterDataTool, RiskCalculatorTool,
  ToolRegistry, SkillRegistry, SkillRouter, ModelRegistry, ModelRouter,
  BasicTextChunker, InMemoryVectorStore, MockEmbeddingProvider, LocalEmbeddingProvider,
  SkillParser, EvaluationEngine, ExecutionTrace, GeminiProvider
} from 'ai-core';

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3001;

// --- REGISTRIES SETUP ---
// RAG dependencies need to be defined before tool registry now
const vectorStore = new InMemoryVectorStore();
const chunker = new BasicTextChunker(100, 20);
const embeddingProvider = process.env.EMBEDDING_PROVIDER === 'mock' 
  ? new MockEmbeddingProvider() 
  : new LocalEmbeddingProvider(process.env.EMBEDDING_MODEL || 'Xenova/all-MiniLM-L6-v2');
const documents: any[] = [];

const toolRegistry = new ToolRegistry();
toolRegistry.register(new CalculatorTool());
toolRegistry.register(new DocumentSearchTool(vectorStore, embeddingProvider));
toolRegistry.register(new DateTimeTool());
toolRegistry.register(new DisasterDataTool());
toolRegistry.register(new RiskCalculatorTool());
toolRegistry.register({ name: 'web_search', description: 'Mock', category: 'network', permissions: [], inputSchema: { type: "object", properties: {} }, execute: async () => ({ result: 'mock' }) });
toolRegistry.register({ name: 'file_reader', description: 'Mock', category: 'fs', permissions: [], inputSchema: { type: "object", properties: {} }, execute: async () => ({ result: 'mock' }) });
toolRegistry.register({ name: 'ast_analyzer', description: 'Mock', category: 'ast', permissions: [], inputSchema: { type: "object", properties: {} }, execute: async () => ({ result: 'mock' }) });

const skillRegistry = new SkillRegistry();
try {
  skillRegistry.register(SkillParser.parseFile(path.resolve(__dirname, '../../../packages/ai-core/skills/document-analysis/SKILL.md')));
  skillRegistry.register(SkillParser.parseFile(path.resolve(__dirname, '../../../packages/ai-core/skills/code-review/SKILL.md')));
  skillRegistry.register(SkillParser.parseFile(path.resolve(__dirname, '../../../packages/ai-core/skills/research/SKILL.md')));
  skillRegistry.register(SkillParser.parseFile(path.resolve(__dirname, '../../../packages/ai-core/skills/math/SKILL.md')));
  
  // Disaster Skills (High Priority)
  skillRegistry.register(SkillParser.parseFile(path.resolve(__dirname, '../../../packages/ai-core/skills/disaster-analysis/SKILL.md')));
  skillRegistry.register(SkillParser.parseFile(path.resolve(__dirname, '../../../packages/ai-core/skills/risk-assessment/SKILL.md')));
  skillRegistry.register(SkillParser.parseFile(path.resolve(__dirname, '../../../packages/ai-core/skills/early-warning/SKILL.md')));
  skillRegistry.register(SkillParser.parseFile(path.resolve(__dirname, '../../../packages/ai-core/skills/emergency-response/SKILL.md')));
  skillRegistry.register(SkillParser.parseFile(path.resolve(__dirname, '../../../packages/ai-core/skills/disaster-assistant/SKILL.md')));
  skillRegistry.register(SkillParser.parseFile(path.resolve(__dirname, '../../../packages/ai-core/skills/incident-reporting/SKILL.md')));
} catch (e) {
  console.log("Failed to load sample skills", e);
}

const modelRegistry = new ModelRegistry();
const openWeightProv = new OpenWeightProvider();
modelRegistry.register(openWeightProv);

modelRegistry.register(new GeminiProvider((process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "") as string));

const skillRouter = new SkillRouter(skillRegistry, embeddingProvider);
const modelRouter = new ModelRouter(modelRegistry);
const runtime = new AgentRuntime(skillRouter, toolRegistry, modelRouter);
const evalEngine = new EvaluationEngine(runtime);


const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: parseInt(process.env.MAX_UPLOAD_SIZE_MB || '10') * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/plain' || file.mimetype === 'text/markdown' || file.mimetype === 'application/pdf' || file.originalname.endsWith('.md')) {
      cb(null, true);
    } else if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only docs and images are supported.'));
    }
  }
});

// --- GLOBAL TRACE STORE (Demo) ---
const traceStore: ExecutionTrace[] = [];

// --- DEMO DATA ---
const demoScenarios = [
  {
    id: "sc-001",
    status: "ACTIVE",
    type: "Flash Flood",
    location: "Downtown District",
    rainfall_mm: 145,
    waterLevel_m: 4.2,
    severity: "Critical",
    riskLevel: "CRITICAL",
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "sc-002",
    status: "MONITORING",
    type: "Wildfire",
    location: "Northern Hills",
    severity: "High",
    riskLevel: "HIGH",
    timestamp: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: "sc-003",
    status: "RESOLVED",
    type: "Earthquake (4.2)",
    location: "East Valley",
    severity: "Medium",
    riskLevel: "MEDIUM",
    timestamp: new Date(Date.now() - 86400000).toISOString()
  }
];
const incidents: any[] = [
  {
    id: "inc-101",
    status: "URGENT",
    type: "Medical Emergency",
    location: "3rd Ave & Main St",
    description: "Elderly resident trapped in flooded home, requires immediate medical attention and evacuation.",
    reportedBy: "Citizen",
    timestamp: new Date(Date.now() - 1200000).toISOString()
  },
  {
    id: "inc-102",
    status: "ASSIGNED",
    type: "Infrastructure",
    location: "Downtown Substation",
    description: "Power lines down, sparking in standing water. Road blocked.",
    reportedBy: "Responder",
    timestamp: new Date(Date.now() - 2400000).toISOString()
  },
  {
    id: "inc-103",
    status: "PENDING",
    type: "Logistics",
    location: "Community Center Shelter",
    description: "Running low on clean drinking water and blankets for displaced residents.",
    reportedBy: "Coordinator",
    timestamp: new Date(Date.now() - 3600000).toISOString()
  }
];

// --- ENDPOINTS ---

app.get('/api/scenarios', (req, res) => {
  res.json({ scenarios: demoScenarios });
});

app.post('/api/analyze-image', upload.single('image') as any, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    
    // Check if we have an API key for multimodal
    if (!(process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY)) {
      fs.unlinkSync(req.file.path);
      return res.status(503).json({ error: 'Multimodal AI provider is not configured. Add GOOGLE_API_KEY to environment.' });
    }
    
    const imageBase64 = fs.readFileSync(req.file.path, { encoding: 'base64' });
    const mimeType = req.file.mimetype;
    fs.unlinkSync(req.file.path);

    // Call Gemini API directly for Vision
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [
            { text: "Analyze this disaster imagery. Return ONLY a valid JSON object matching this schema: { disasterType: string, severity: 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL', estimatedLocation: string, summary: string, hazards: string[], recommendations: string[] }. Do not wrap in markdown codeblocks." },
            { inline_data: { mime_type: mimeType, data: imageBase64 } }
          ] 
        }]
      })
    });
    
    if (!response.ok) throw new Error("Gemini Vision API failed");
    const data = await response.json();
    const rawText = data.candidates[0].content.parts[0].text;
    
    // Parse JSON
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const analysis = JSON.parse(cleanJson);
    
    res.json({ success: true, analysis });
  } catch (error: any) {
    res.status(500).json({ error: `Image Analysis Failed: ${error.message}` });
  }
});
app.get('/api/scenarios/:id', (req, res) => {
  const scenario = demoScenarios.find(s => s.id === req.params.id);
  if (scenario) res.json({ scenario });
  else res.status(404).json({ error: 'Scenario not found' });
});
app.get('/api/incidents', (req, res) => {
  res.json({ incidents });
});
app.post('/api/incidents', (req, res) => {
  const incident = { id: `inc-${Date.now()}`, ...req.body, status: 'DEMO / SIMULATED', timestamp: new Date().toISOString() };
  incidents.push(incident);
  res.json({ success: true, incident });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    console.log('[Copilot]\nRequest received');

    // The runtime handles task orchestration.
    const result = await runtime.executeTask({ id: `task_${Date.now()}`, input: message, history });
    
    // Save trace for dashboard
    const trace = new ExecutionTrace(result.taskId);
    result.events.forEach((e: any) => trace.addEvent(e.type, e.status, e.metadata, e.duration));
    traceStore.push(trace);

    // Extract structured data for frontend
    const skillSelected = result.events.find((e: any) => e.type === 'SKILL_SELECTED')?.metadata?.skill;
    const providerSelected = result.events.find((e: any) => e.type === 'MODEL_SELECTED')?.metadata?.provider;
    const toolsUsed = result.events.filter((e: any) => e.type === 'TOOL_COMPLETED').map((e: any) => e.metadata?.tool);
    
    console.log('[Copilot]\nResponse returned');
    
    res.json({
      taskId: result.taskId,
      response: result.error ? `Error: ${result.error}` : result.output,
      error: result.error,
      skill: skillSelected,
      provider: providerSelected,
      toolsUsed,
      events: result.events // included for legacy dashboard trace view
    });
  } catch (error: any) {
    res.status(500).json({ error: `Failed to process chat message: ${error.message}` });
  }
});

app.get('/api/tools', (req, res) => {
  res.json({ tools: toolRegistry.getAll().map((t: any) => ({ name: t.name, description: t.description, category: t.category, permissions: t.permissions })) });
});

app.get('/api/skills', (req, res) => {
  res.json({ skills: skillRegistry.getAll() });
});

app.get('/api/traces', (req, res) => {
  res.json({ traces: traceStore.map(t => ({ taskId: t.taskId, events: t.getEvents() })) });
});

app.post('/api/evaluations/run', async (req, res) => {
  try {
    const { cases } = req.body;
    if (!cases || !Array.isArray(cases)) return res.status(400).json({ error: 'Cases array is required' });
    const runResult = await evalEngine.runSuite(cases);
    res.json(runResult);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Document Upload endpoints
app.post('/api/documents/upload', upload.single('file') as any, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    let extractedText = '';
    if (req.file.mimetype === 'application/pdf') {
      throw new Error('PDF extraction is not natively supported yet. Please use .txt or .md');
    } else {
      extractedText = fs.readFileSync(req.file.path, 'utf8');
    }

    const newDoc = {
      id: `doc-${Date.now()}`,
      title: req.file.originalname,
      content: extractedText,
    };
    documents.push(newDoc);
    
    const chunks = chunker.chunk(newDoc);
    const vectors = await embeddingProvider.embedBatch(chunks.map((c: any) => c.text));
    chunks.forEach((c: any, i: number) => c.vector = vectors[i]);
    await vectorStore.addChunks(chunks);

    // Clean up file
    fs.unlinkSync(req.file.path);

    res.json({ success: true, document: newDoc, chunksCreated: chunks.length });
  } catch (error: any) {
    res.status(500).json({ error: `Failed to process document: ${error.message}` });
  }
});

app.get('/api/documents', (req, res) => {
  res.json({ documents });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
