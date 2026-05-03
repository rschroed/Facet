import type {
  ArtifactId,
  FacetsCanvasView,
  FacetsArtifact,
  FacetsProjectFile,
  FacetsRelationship,
  PromptTarget,
} from "../domain";
import type { ArtifactNode, ArtifactNodeData, RelationshipEdge } from "./types";

export type FacetsReactFlowGraph = {
  nodes: ArtifactNode[];
  edges: RelationshipEdge[];
};

export type MapProjectFileToReactFlowOptions = {
  canvasView?: FacetsCanvasView;
  onToggleExpanded?: (artifactId: ArtifactId) => void;
};

export function mapProjectFileToReactFlow(
  projectFile: FacetsProjectFile,
  options: MapProjectFileToReactFlowOptions = {},
): FacetsReactFlowGraph {
  const canvasView = options.canvasView ?? projectFile.canvasView;

  return {
    nodes: projectFile.project.canvas.artifacts.map((artifact) =>
      mapArtifactToNode(artifact, canvasView, options.onToggleExpanded),
    ),
    edges: projectFile.project.canvas.relationships.map(mapRelationshipToEdge),
  };
}

function mapArtifactToNode(
  artifact: FacetsArtifact,
  canvasView: FacetsCanvasView,
  onToggleExpanded?: (artifactId: ArtifactId) => void,
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
): ArtifactNodeData {
  switch (artifact.type) {
    case "brief":
      return {
        artifact,
        typeLabel: "Brief",
        summary: artifact.brief,
        expanded,
        onToggleExpanded,
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
): RelationshipEdge {
  return {
    id: relationship.id,
    type: "smoothstep",
    source: relationship.sourceId,
    target: relationship.targetId,
    label: getRelationshipLabel(relationship),
    data: { relationship },
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
