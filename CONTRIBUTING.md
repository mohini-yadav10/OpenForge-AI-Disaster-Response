# Contributing to OpenForge AI

Thank you for your interest in contributing to OpenForge AI! We welcome contributions from developers, researchers, and designers of all skill levels. 

As part of **Hacktoberfest 2026**, we are actively seeking PRs that improve the core architecture, add new tools, refine skills, and build out integrations.

## How to Contribute

### 1. Find an Issue
Check out the `Issues` tab on GitHub. Look for labels like `good first issue`, `hacktoberfest`, or `help wanted`.

### 2. Fork and Clone
Fork the repository and clone it to your local machine:
```bash
git clone https://github.com/your-username/openforge-ai.git
```

### 3. Create a Branch
Create a new branch for your feature or bugfix:
```bash
git checkout -b feature/your-feature-name
```

### 4. Make Your Changes
Make your code changes! Please adhere to the following guidelines:
- **TypeScript**: Write clean, strongly-typed TypeScript.
- **Tests**: Ensure any new tools or skills have corresponding tests in the Vitest suite (`packages/ai-core/src/__tests__`).
- **Formatting**: Keep the code formatted and clean.

### 5. Add a Skill
If you're adding a new Skill, simply create a new folder under `packages/ai-core/skills/your-skill-name` and add a `SKILL.md` file using the standard Markdown parser format. The system will auto-load it!

### 6. Submit a Pull Request
Push your branch to your fork and submit a Pull Request to the `main` branch of the upstream repository. Ensure you provide a clear description of what your PR accomplishes.

## Code of Conduct

Please be respectful and kind to others. Harassment or abuse of any kind will not be tolerated. Let's build a welcoming open-source community together!
