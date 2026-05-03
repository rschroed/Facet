import type {
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

export function mapProjectFileToReactFlow(
  projectFile: FacetsProjectFile,
): FacetsReactFlowGraph {
  return {
    nodes: projectFile.project.canvas.artifacts.map((artifact) =>
      mapArtifactToNode(artifact, projectFile),
    ),
    edges: projectFile.project.canvas.relationships.map(mapRelationshipToEdge),
  };
}

function mapArtifactToNode(
  artifact: FacetsArtifact,
  projectFile: FacetsProjectFile,
): ArtifactNode {
  const nodeView = projectFile.canvasView.nodes[artifact.id];

  return {
    id: artifact.id,
    type: "artifact",
    position: nodeView.position,
    data: getArtifactNodeData(artifact),
    draggable: false,
    selectable: false,
    style: nodeView.size
      ? {
          width: nodeView.size.width,
          minHeight: nodeView.size.height,
        }
      : undefined,
  };
}

function getArtifactNodeData(artifact: FacetsArtifact): ArtifactNodeData {
  switch (artifact.type) {
    case "brief":
      return {
        artifact,
        typeLabel: "Brief",
        summary: artifact.brief,
        detail: artifact.audience,
      };
    case "direction":
      return {
        artifact,
        typeLabel: "Direction",
        summary: artifact.angle,
        detail: artifact.notes,
      };
    case "prompt":
      return {
        artifact,
        typeLabel: "Prompt",
        summary: artifact.summary,
        detail: getPromptTargetLabel(artifact.target),
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

function getPromptTargetLabel(target: PromptTarget): string {
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
