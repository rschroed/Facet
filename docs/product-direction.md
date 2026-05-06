# Product Direction

Facets v1 is a canvas-first prompt workbench for designers.

The product starts as a React Flow canvas of editable artifact nodes. It is not a canvas plus inspector app. The main interaction should happen directly inside nodes on the canvas.

## Core Artifacts

Facets owns three artifact types:

- `brief`
- `direction`
- `prompt`

React Flow renders those artifacts, but React Flow node data is not the long-term source of truth.

See [Artifact model](artifact-model.md) for the initial TypeScript domain model and React Flow boundary.

## Direction Sets

A Direction Set is the v1 product model for organizing concept directions generated from a Brief.

Direction Sets are not a fourth artifact type. Brief, Direction, and Prompt remain the core editable artifacts. A Direction Set is a domain grouping concept that can be saved as project data later and rendered as a group on the React Flow canvas.

The initial Direction Set field is:

- title

The default naming pattern can be simple and deterministic, such as `Direction Set 1`, `Direction Set 2`, and so on. Richer naming, summaries, timestamps, brief snapshots, and generation provenance are deferred.

## Direction Set Workflow

A new canvas can start with a Brief and an empty Direction Set. The empty set is the visible destination for Direction work before any Directions exist.

Brief nodes own starting a fresh exploration:

- `Create direction set` creates a new empty Direction Set connected to the current Brief.

Direction Set headers own generating Direction options:

- `Generate directions` on an empty set creates the first batch of Direction nodes in that set.
- `Generate more` or equivalent copy on a populated set appends another batch to that same set.

When the Brief changes, generating again in the current set should append to that set by default. Creating a new Direction Set is the explicit way to preserve prior exploration and start a fresh run from the modified Brief.

Multiple Direction Sets can be connected to the same Brief. They represent different explorations, runs, or facets of the same design problem.

Drag-to-create and drag-to-connect gestures are deferred. V1 should use explicit controls before adding advanced canvas gestures.

## Core Relationships

Facets owns relationship types separately from React Flow edges:

- `brief_to_direction`
- `direction_to_prompt`
- `prompt_sequence`

React Flow edges are view objects derived from Facets relationships.

Direction Sets introduce model relationships that should be represented in Facets project data before they are rendered as React Flow edges:

- `brief_to_direction_set`
- `contains_direction`

These relationship names are the intended model direction for the Direction Set implementation work. Existing relationship types remain valid for the current Brief, Direction, and Prompt artifact flow.

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

See [Local project file](local-project-file.md) for the documented `.facets.json` shape.

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
