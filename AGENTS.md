# Agent Guide

This repo uses GitHub Issues as the work tracker. Do not implement work that is not represented by an issue unless the user explicitly asks for a small direct fix.

## Working Rules

- Start from the relevant issue.
- Use an issue-numbered branch: `issue-<number>-short-slug`.
- Open a draft PR early for each issue branch.
- Keep PRs scoped to one issue unless the user explicitly approves combining work.
- Link the issue in the PR body.
- Use `Closes #<number>` only when the PR is ready to merge.

## Product Rules

- Facets v1 is canvas-first.
- React Flow is the rendering surface, not the domain model.
- Store Brief, Direction, Prompt, and relationship data in Facets-owned model types.
- Treat React Flow node/edge objects as view adapters derived from the Facets model.
- Do not introduce side panels, modals, inspectors, or fullscreen editors until editing complexity proves they are needed.
- Do not add OpenAI calls, API key management, agent execution, or direct Figma MCP execution in v1.

## Validation

For documentation-only work, verify links and issue references manually.

For app work, run the relevant build/check commands documented by that issue. Once the Tauri scaffold exists, app PRs should at minimum document whether `npm run build` and the Tauri check/build path were run.
