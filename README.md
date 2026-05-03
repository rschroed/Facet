# Facets

Facets is a local-first Mac desktop prompt workbench for designers using AI agents in their design process.

The app helps designers move from a rough brief into clearer concept directions and paste-ready prompts for tools such as ChatGPT, Codex, Claude Desktop, Cursor, or other MCP-enabled environments. Facets does not execute Figma MCP in v1. It generates better instructions so external tools can execute them.

## V1 Scope

- Tauri desktop shell for macOS
- React + TypeScript frontend
- Rust backend commands
- Local SQLite project storage
- macOS Keychain storage for provider API keys
- Provider-agnostic model task layer
- Initial OpenAI provider adapter
- Bundled prompt templates
- Brief, Directions, and Prompts workspace
- Copy-to-clipboard handoff

## Product Workflow

1. Create a local project.
2. Write or improve a brief.
3. Generate several concept directions.
4. Select a direction.
5. Generate a paste-ready prompt for an external agent tool.
6. Copy the prompt into an MCP-enabled tool.
7. Review the result in Figma.
8. Return to Facets for the next refinement prompt.

## Development

Install dependencies:

```bash
npm install
```

Run the app in development:

```bash
npm run tauri:dev
```

Build the web shell:

```bash
npm run build
```

Check the Rust backend:

```bash
npm run tauri -- info
```

## Repository Layout

- `src/` - React application
- `src-tauri/` - Tauri Rust backend
- `templates/prompts/` - bundled prompt templates
- `docs/` - product and architecture notes

## V1 Non-Goals

Facets v1 does not include hosted accounts, cloud sync, collaboration, direct Figma OAuth, direct Figma MCP execution, production billing, or Figma file mutation.
