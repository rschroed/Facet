# Artifact Model

Facets owns the artifact model. React Flow renders that model on a canvas, but React Flow state is not the long-term source of truth.

## Project and Canvas

`FacetsProject` is the minimal project container for v1 model work:

```ts
type FacetsProject = {
  id: ProjectId;
  name: string;
  canvas: FacetsCanvas;
};

type FacetsCanvas = {
  id: CanvasId;
  artifacts: FacetsArtifact[];
  relationships: FacetsRelationship[];
};
```

The canvas groups artifact and relationship content. Local project files store canvas rendering state separately.

## Direction Sets

A Direction Set is a Facets domain grouping concept for organizing Direction artifacts generated from or associated with a Brief.

Direction Sets are not artifacts. They do not expand the core artifact union beyond Brief, Direction, and Prompt. Direction artifacts remain the concept-level design options; Direction Sets organize those options.

The minimal v1 Direction Set shape is intentionally small:

```ts
type DirectionSet = {
  id: DirectionSetId;
  title: string;
};
```

The first implementation should treat `title` as the only Direction Set content field. Summaries, generation provenance, brief snapshots, timestamps, selection state, and model/provider metadata remain deferred.

Direction Sets are project data, not React Flow state. React Flow group nodes may render Direction Sets on the canvas, but the React Flow group node is not the source of truth for the Direction Set.

## Artifacts

Facets has three artifact types:

- `brief`
- `direction`
- `prompt`

Each artifact is a discriminated TypeScript object with its own content fields:

- Brief: `id`, `type`, `title`, `brief`, `audience`, `constraints`.
- Direction: `id`, `type`, `title`, `angle`, `notes`, optional `rationale`.
- Prompt: `id`, `type`, `title`, `target`, `summary`, `promptText`.

Prompt targets are:

```ts
"chatgpt" | "codex" | "figma_mcp" | "generic"
```

## Relationships

Relationships are Facets domain objects, not React Flow edges:

```ts
type FacetsRelationship = {
  id: RelationshipId;
  type: FacetsRelationshipType;
  sourceId: ArtifactId;
  targetId: ArtifactId;
};
```

Relationship types are:

- `brief_to_direction`
- `direction_to_prompt`
- `prompt_sequence`

Direction Set implementation work should add relationship types for grouping without turning React Flow edges into model state:

- `brief_to_direction_set`
- `contains_direction`

`brief_to_direction_set` connects a Brief to a Direction Set. `contains_direction` connects a Direction Set to each Direction artifact in that set.

React Flow edges should be derived from these relationship objects.

## React Flow Boundary

Facets artifacts and relationships are the source of truth. React Flow nodes and edges are derived render objects.

React Flow `node.data` can carry whatever a canvas component needs to render, but it must not become the long-term artifact store for Brief, Direction, Prompt, or relationship content.

Collapsed and expanded node state is canvas rendering state, not artifact content. Local project files keep this state outside `FacetsProject.canvas` so artifact content remains separate from view state.

The same boundary applies to Direction Sets. A React Flow group node can render a Direction Set, but Direction Set identity, title, and membership should come from Facets project data and relationships.

## Persistence Boundary

Local persistence should later save and load `FacetsProject` data, not raw React Flow state.

Viewport and layout data may be stored separately alongside the artifact model, but artifact content and relationships should remain independent from React Flow rendering state.

See [Local project file](local-project-file.md) for the `.facets.json` wrapper and canvas view shape. Save/load behavior remains deferred to a later issue.
