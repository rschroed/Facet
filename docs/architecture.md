# Architecture

Facets is a local-first Tauri app with a React frontend and Rust backend.

## Layers

- UI layer: React views for Brief, Directions, and Prompts.
- Command layer: Tauri commands expose local project, provider settings, and model tasks.
- Storage layer: SQLite database stored in the user's local app data directory.
- Secret layer: macOS Keychain stores API keys by provider.
- Model layer: provider-agnostic tasks map product actions to provider adapters.
- Template layer: bundled markdown templates shape model instructions and external prompts.

## Model Tasks

The app thinks in product tasks rather than provider-specific APIs:

- `improveBrief`
- `generateDirections`
- `critiqueDirections`
- `generatePrompt`
- `revisePrompt`
- `generatePromptSequence`

Provider adapters normalize request and response differences across OpenAI, Anthropic, Gemini, Ollama, and future providers.

## Local Data

SQLite stores non-secret project data:

- projects
- briefs
- directions
- generated prompts
- prompt sequences
- app settings excluding secret values

API keys are never stored in SQLite.

## V1 Boundary

Facets prepares prompts for external agent tools. It does not run Figma MCP, mutate Figma files, or track external agent execution.
