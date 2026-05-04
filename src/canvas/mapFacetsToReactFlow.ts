import type {
  ArtifactId,
  FacetsCanvasView,
  FacetsArtifact,
  FacetsProject,
  FacetsProjectFile,
  FacetsRelationship,
  PromptTarget,
} from "../domain";
import type {
  ArtifactNode,
  ArtifactNodeData,
  BriefArtifactPatch,
  RelationshipEdge,
} from "./types";

export type FacetsReactFlowGraph = {
  nodes: ArtifactNode[];
  edges: RelationshipEdge[];
};

export type MapProjectFileToReactFlowOptions = {
  project?: FacetsProject;
  canvasView?: FacetsCanvasView;
  onToggleExpanded?: (artifactId: ArtifactId) => void;
  onUpdateBrief?: (artifactId: ArtifactId, patch: BriefArtifactPatch) => void;
  onGenerateDirections?: (sourceBriefId: ArtifactId) => void;
};

export function mapProjectFileToReactFlow(
  projectFile: FacetsProjectFile,
  options: MapProjectFileToReactFlowOptions = {},
): FacetsReactFlowGraph {
  const project = options.project ?? projectFile.project;
  const canvasView = options.canvasView ?? projectFile.canvasView;
  const artifactsById = new Map(
    project.canvas.artifacts.map((artifact) => [artifact.id, artifact]),
  );
  const generateDirectionsRelationshipId = project.canvas.relationships.find(
    (relationship) =>
      relationship.type === "brief_to_direction" &&
      artifactsById.get(relationship.sourceId)?.type === "brief",
  )?.id;

  return {
    nodes: project.canvas.artifacts.map((artifact) =>
      mapArtifactToNode(
        artifact,
        canvasView,
        options.onToggleExpanded,
        options.onUpdateBrief,
      ),
    ),
    edges: project.canvas.relationships.map((relationship) =>
      mapRelationshipToEdge(
        relationship,
        relationship.id === generateDirectionsRelationshipId,
        options.onGenerateDirections,
      ),
    ),
  };
}

function mapArtifactToNode(
  artifact: FacetsArtifact,
  canvasView: FacetsCanvasView,
  onToggleExpanded?: (artifactId: ArtifactId) => void,
  onUpdateBrief?: (artifactId: ArtifactId, patch: BriefArtifactPatch) => void,
): ArtifactNode {
  const nodeView = canvasView.nodes[artifact.id];

  return {
    id: artifact.id,
    type: "artifact",
    position: nodeView.position,
    data: getArtifactNodeData(
      artifact,
      Boolean(nodeView.expanded),
      onToggleExpanded,
      onUpdateBrief,
    ),
    draggable: false,
    selectable: false,
    zIndex: 2,
    style: nodeView.size
      ? {
          width: nodeView.size.width,
          minHeight: nodeView.size.height,
        }
      : undefined,
  };
}

function getArtifactNodeData(
  artifact: FacetsArtifact,
  expanded: boolean,
  onToggleExpanded?: (artifactId: ArtifactId) => void,
  onUpdateBrief?: (artifactId: ArtifactId, patch: BriefArtifactPatch) => void,
): ArtifactNodeData {
  switch (artifact.type) {
    case "brief":
      return {
        artifact,
        typeLabel: "Brief",
        summary: artifact.brief,
        expanded,
        onToggleExpanded,
        onUpdateBrief,
      };
    case "direction":
      return {
        artifact,
        typeLabel: "Direction",
        summary: artifact.angle,
        expanded,
        onToggleExpanded,
      };
    case "prompt":
      return {
        artifact,
        typeLabel: "Prompt",
        summary: artifact.summary,
        expanded,
        onToggleExpanded,
      };
  }
}

function mapRelationshipToEdge(
  relationship: FacetsRelationship,
  showGenerateDirections: boolean,
  onGenerateDirections?: (sourceBriefId: ArtifactId) => void,
): RelationshipEdge {
  return {
    id: relationship.id,
    type: "relationship",
    source: relationship.sourceId,
    target: relationship.targetId,
    label: getRelationshipLabel(relationship),
    data: {
      relationship,
      showGenerateDirections,
      onGenerateDirections,
    },
    selectable: false,
    reconnectable: false,
  };
}

function getRelationshipLabel(relationship: FacetsRelationship): string {
  switch (relationship.type) {
    case "brief_to_direction":
      return "Direction";
    case "direction_to_prompt":
      return "Prompt";
    case "prompt_sequence":
      return "Sequence";
  }
}

export function getPromptTargetLabel(target: PromptTarget): string {
  switch (target) {
    case "chatgpt":
      return "ChatGPT";
    case "codex":
      return "Codex";
    case "figma_mcp":
      return "Figma MCP";
    case "generic":
      return "Generic";
  }
}
