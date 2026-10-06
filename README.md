# OpenForge AI - Open-Source Agent Harness

**OpenForge AI** is a production-grade, modular, extensible framework designed to rapidly bootstrap AI agent applications. It provides the essential scaffolding required to build, test, and deploy intelligent agents with complete control over the runtime environment, tools, skills, and model interactions.

Built as an open-source platform, OpenForge is highly suited for hackathons, prototyping, and enterprise-grade AI architectural planning.

## Features

- **Agent Runtime**: A robust execution environment for standardizing agent tasks, contexts, and results.
- **Skill & Tool Registry**: A dynamic capability system where tools (code-level operations) and skills (markdown-defined compound actions) are securely registered and routed via strict permission schemes.
- **Hybrid Model Routing**: Abstracted `AIProvider` interfaces and a `ModelRouter` capable of deterministic fallback routing to simulate reasoning workflows even in demo modes.
- **First-class Execution Trace**: Detailed internal telemetrics (`AgentEvent`) captured seamlessly without exposing sensitive chain-of-thought logic.
- **Evaluation Engine**: A deterministic testing suite designed to evaluate output quality, tool usage, latency, and skill accuracy against your agent workflows.
- **RAG Abstractions**: Complete foundational interfaces for document loading, extraction, chunking, and vector-store retrieval using modular Embedding Providers.
- **Full Stack Next.js & Express**: A beautiful, multi-tab frontend interface exposing chat, developer traces, registries, and an interactive evaluation dashboard.

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/openforge-ai.git
   cd openforge-ai
   ```

2. Install monorepo dependencies:
   ```bash
   npm install
   ```

3. Build the core packages:
   ```bash
   cd packages/ai-core
   npm run build
   ```

### Running the Application

OpenForge AI uses a separated frontend and backend architecture to cleanly divide the agent runtime from the presentation layer.

**Start the Backend Server (Express):**
```bash
cd apps/server
npm run dev
```
The server will run on `http://localhost:3001`, dynamically parsing `SKILL.md` files and hosting the core Agent Runtime.

**Start the Frontend Client (Vite/React):**
```bash
cd apps/web
npm run dev
```
The web dashboard will be available at `http://localhost:3000`. 

## Architecture

The `ai-core` package forms the heart of the system.
- `AgentRuntime`: Orchestrates task execution.
- `ToolRegistry` & `SkillRegistry`: Manage available capabilities.
- `ModelRouter`: Directs prompts to the right LLM provider.
- `ExecutionTrace`: Stores and formats lifecycle telemetry.
- `EvaluationEngine`: Runs assertions on outputs and execution traces.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Hacktoberfest 2026

OpenForge AI is proudly competing in Hacktoberfest '26! If you're looking for an open-source AI project to contribute to, please check out our `CONTRIBUTING.md` guidelines.
