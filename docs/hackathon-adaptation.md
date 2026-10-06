# Hackathon Adaptation Guide

When the Hacktoberfest problem statement is revealed, use this guide to rapidly transform OpenForge AI into your winning solution.

## The Process

### Step 1: Analyze the Problem
Understand the users, pain points, and required inputs/outputs. Determine what AI brings to the solution.

### Step 2: Define Domain Agents
In `apps/server/src/index.ts` (or your database), replace the generic "Demo Assistant" with specialized agents (e.g., "Smart Civic Assistant", "Agriculture Advisor"). Update their `systemInstructions`.

### Step 3: Add Domain Tools
Create new tools in `packages/ai-core/src/tool.ts` (e.g., `WeatherAPI`, `CropYieldPredictor`) and register them to your agents. 

### Step 4: Inject Knowledge (RAG)
Upload domain-specific documents (PDFs, text) through the UI to enrich the agent's context.

### Step 5: Branding & UI
Modify the frontend (`apps/web`) to reflect the domain. Change colors in `tailwind.config.js`, update the landing page copy, and remove unused sections to streamline the demo.

### Step 6: Demo Preparedness
Ensure `DEMO_MODE` is fully configured so your presentation works flawlessly, even if the conference wifi fails.
