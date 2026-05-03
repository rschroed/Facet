# Product Direction

Facets v1 is a canvas-first prompt workbench for designers.

The product starts as a React Flow canvas of editable artifact nodes. It is not a canvas plus inspector app. The main interaction should happen directly inside nodes on the canvas.

## Core Artifacts

Facets owns three artifact types:

- `brief`
- `direction`
- `prompt`

React Flow renders those artifacts, but React Flow node data is not the long-term source of truth.

## Core Relationships

Facets owns relationship types separately from React Flow edges:

- `brief_to_direction`
- `direction_to_prompt`
- `prompt_sequence`

React Flow edges are view objects derived from Facets relationships.

## Node States

Each artifact appears as a node with two states:

- `collapsed` - compact scan mode showing type, title, short summary, and primary action.
- `expanded` - editable mode showing the node's core fields directly on the canvas.

## Initial Editable Fields

Brief nodes:

- project/problem title
- short brief
- audience
- constraints

Direction nodes:

- direction title
- angle
- notes
- optional rationale

Prompt nodes:

- prompt title
- target
- prompt summary
- prompt text

Prompt nodes include a copy action for manual paste into ChatGPT, Codex, or ChatGPT sessions using the Figma MCP.

## Local-First Persistence

Local persistence should save and load Facets project data, not raw React Flow state.

Artifact content should remain separate from canvas rendering state. React Flow viewport and layout data may be saved alongside the artifact model, but should not become the source of truth for Brief, Direction, Prompt, or relationship content.

## V1 Boundaries

Facets v1 does not execute:

- OpenAI calls
- agent runs
- direct Figma MCP actions
- direct API key management

Out of scope for v1:

- multi-canvas projects
- collaboration
- cloud sync
- agent execution
- direct API key management
- direct Figma MCP execution

Side panels, modals, inspectors, and focus editors are deferred until real editing complexity requires them.
