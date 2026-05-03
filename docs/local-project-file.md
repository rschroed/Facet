# Local Project File

Facets project files use plain JSON with the `.facets.json` extension.

The file format is local-first. It stores Facets project data and canvas rendering state in one file without requiring cloud sync, accounts, collaboration, or hosted services.

## File Shape

A local project file has a versioned wrapper:

```ts
type FacetsProjectFile = {
  app: "facets";
  schemaVersion: 1;
  project: FacetsProject;
  canvasView: FacetsCanvasView;
};
```

`project` stores Facets domain data. `canvasView` stores canvas rendering state.

The project model remains focused on artifact and relationship content:

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

Canvas rendering state is stored separately:

```ts
type FacetsCanvasView = {
  canvasId: CanvasId;
  viewport: FacetsCanvasViewport;
  nodes: Record<ArtifactId, FacetsCanvasNodeView>;
};

type FacetsCanvasViewport = {
  x: number;
  y: number;
  zoom: number;
};

type FacetsCanvasNodeView = {
  expanded?: boolean;
  position: FacetsCanvasNodePosition;
  size?: FacetsCanvasNodeSize;
};

type FacetsCanvasNodePosition = {
  x: number;
  y: number;
};

type FacetsCanvasNodeSize = {
  width: number;
  height: number;
};
```

`canvasView.canvasId` must reference `project.canvas.id`.

## React Flow Boundary

React Flow nodes are derived from `project.canvas.artifacts` plus `canvasView.nodes`.

React Flow edges are derived from `project.canvas.relationships`.

React Flow viewport is derived from `canvasView.viewport`.

Raw React Flow state should not be serialized as the Facets project file format. React Flow can provide useful rendering details, but the saved file should preserve the Facets domain model and the minimum canvas view state needed to restore the workbench.

Artifact content lives in `project.canvas.artifacts`. Relationship content lives in `project.canvas.relationships`. Viewport, position, size, and expanded state live in `canvasView`.

## Example

The example below is illustrative documentation, not a committed sample file or runtime fixture.

```json
{
  "app": "facets",
  "schemaVersion": 1,
  "project": {
    "id": "project-1",
    "name": "Homepage exploration",
    "canvas": {
      "id": "canvas-1",
      "artifacts": [
        {
          "id": "brief-1",
          "type": "brief",
          "title": "Homepage concept",
          "brief": "Explore a clearer homepage direction for a design tooling product.",
          "audience": "Product designers and design leaders",
          "constraints": "Keep the page practical, local-first, and focused on prompt quality."
        },
        {
          "id": "direction-1",
          "type": "direction",
          "title": "Workbench canvas",
          "angle": "Show the design process as connected editable artifacts.",
          "notes": "Use a lightweight canvas with brief, direction, and prompt nodes.",
          "rationale": "The structure makes iteration visible without introducing workflow overhead."
        },
        {
          "id": "prompt-1",
          "type": "prompt",
          "title": "Generate first concept",
          "target": "chatgpt",
          "summary": "Ask an agent to create a first homepage concept from the selected direction.",
          "promptText": "Create a homepage concept in Figma based on the brief and workbench canvas direction."
        }
      ],
      "relationships": [
        {
          "id": "relationship-1",
          "type": "brief_to_direction",
          "sourceId": "brief-1",
          "targetId": "direction-1"
        },
        {
          "id": "relationship-2",
          "type": "direction_to_prompt",
          "sourceId": "direction-1",
          "targetId": "prompt-1"
        }
      ]
    }
  },
  "canvasView": {
    "canvasId": "canvas-1",
    "viewport": {
      "x": 0,
      "y": 0,
      "zoom": 1
    },
    "nodes": {
      "brief-1": {
        "expanded": true,
        "position": {
          "x": 0,
          "y": 0
        },
        "size": {
          "width": 320,
          "height": 240
        }
      },
      "direction-1": {
        "position": {
          "x": 420,
          "y": 0
        }
      },
      "prompt-1": {
        "position": {
          "x": 840,
          "y": 0
        }
      }
    }
  }
}
```

## Deferred Work

This file shape does not implement save/load behavior, file dialogs, migrations, React Flow adapters, prompt export, or runtime persistence.

The v1 local file contract does not include timestamps. Future issues can add migration behavior when a future `schemaVersion` is introduced.
