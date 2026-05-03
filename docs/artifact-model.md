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

React Flow edges should be derived from these relationship objects.

## React Flow Boundary

Facets artifacts and relationships are the source of truth. React Flow nodes and edges are derived render objects.

React Flow `node.data` can carry whatever a canvas component needs to render, but it must not become the long-term artifact store for Brief, Direction, Prompt, or relationship content.

Collapsed and expanded node state is canvas rendering state, not artifact content. Local project files keep this state outside `FacetsProject.canvas` so artifact content remains separate from view state.

## Persistence Boundary

Local persistence should later save and load `FacetsProject` data, not raw React Flow state.

Viewport and layout data may be stored separately alongside the artifact model, but artifact content and relationships should remain independent from React Flow rendering state.

See [Local project file](local-project-file.md) for the `.facets.json` wrapper and canvas view shape. Save/load behavior remains deferred to a later issue.
