# Facets

Facets is a local-first Mac app for designers shaping prompts for AI-assisted design workflows.

The restart direction is canvas-first: Facets v1 is a React Flow canvas of editable artifact nodes. Brief, Direction, and Prompt artifacts are edited directly on the canvas rather than through a side panel, inspector, modal, or fullscreen editor.

## Product Stance

- React Flow is the primary app surface for v1.
- React Flow renders the canvas, but Facets owns the artifact/domain model.
- Nodes are the primary editing interface.
- Facets does not execute OpenAI calls, agent runs, or Figma MCP actions in v1.
- Prompt nodes support manual copy for paste into ChatGPT, Codex, or ChatGPT sessions using the Figma MCP.

Out of scope for v1: multi-canvas projects, collaboration, cloud sync, agent execution, direct API key management, and direct Figma MCP execution.

## Workflow

GitHub Issues are the source of truth for all work. Every implementation task should start from an issue, use an issue-numbered branch, and open a draft PR early.

See:

- [GitHub workflow](docs/github-workflow.md)
- [Product direction](docs/product-direction.md)
- [Artifact model](docs/artifact-model.md)

## Current Milestone

The repo is being restarted from a docs-first foundation. The previous scaffold is preserved on the `archive/pre-restart-scaffold` branch.

Issue #5 added the first app scaffold: a Tauri v2 + React + TypeScript shell with a full-window blank React Flow canvas. Issue #4 defines the first Facets artifact model. Product-specific node behavior starts in later issues.

## Development

Install dependencies:

```bash
npm install
```

Run the web app in development:

```bash
npm run dev
```

Build the web app:

```bash
npm run build
```

Run the Tauri desktop app:

```bash
npm run tauri:dev
```

Build the Tauri desktop app:

```bash
npm run tauri:build
```
