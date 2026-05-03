export type ProjectId = string;
export type CanvasId = string;
export type ArtifactId = string;
export type RelationshipId = string;

export type FacetsProject = {
  id: ProjectId;
  name: string;
  canvas: FacetsCanvas;
};

export type FacetsCanvas = {
  id: CanvasId;
  artifacts: FacetsArtifact[];
  relationships: FacetsRelationship[];
};

export type FacetsProjectFile = {
  app: "facets";
  schemaVersion: 1;
  project: FacetsProject;
  canvasView: FacetsCanvasView;
};

export type FacetsCanvasView = {
  canvasId: CanvasId;
  viewport: FacetsCanvasViewport;
  nodes: Record<ArtifactId, FacetsCanvasNodeView>;
};

export type FacetsCanvasViewport = {
  x: number;
  y: number;
  zoom: number;
};

export type FacetsCanvasNodeView = {
  expanded?: boolean;
  position: FacetsCanvasNodePosition;
  size?: FacetsCanvasNodeSize;
};

export type FacetsCanvasNodePosition = {
  x: number;
  y: number;
};

export type FacetsCanvasNodeSize = {
  width: number;
  height: number;
};

export type BriefArtifact = {
  id: ArtifactId;
  type: "brief";
  title: string;
  brief: string;
  audience: string;
  constraints: string;
};

export type DirectionArtifact = {
  id: ArtifactId;
  type: "direction";
  title: string;
  angle: string;
  notes: string;
  rationale?: string;
};

export type PromptTarget = "chatgpt" | "codex" | "figma_mcp" | "generic";

export type PromptArtifact = {
  id: ArtifactId;
  type: "prompt";
  title: string;
  target: PromptTarget;
  summary: string;
  promptText: string;
};

export type FacetsArtifact =
  | BriefArtifact
  | DirectionArtifact
  | PromptArtifact;

export type FacetsRelationshipType =
  | "brief_to_direction"
  | "direction_to_prompt"
  | "prompt_sequence";

export type FacetsRelationship = {
  id: RelationshipId;
  type: FacetsRelationshipType;
  sourceId: ArtifactId;
  targetId: ArtifactId;
};
