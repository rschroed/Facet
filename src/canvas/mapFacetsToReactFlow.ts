import type {
  ArtifactId,
  DirectionSet,
  DirectionSetId,
  FacetsArtifact,
  FacetsCanvasView,
  FacetsProject,
  FacetsProjectFile,
  FacetsRelationship,
  PromptTarget,
} from "../domain";
import type {
  ArtifactNode,
  ArtifactNodeData,
  BriefArtifactPatch,
  DirectionArtifactPatch,
  DirectionGroupNode,
  FacetsCanvasNode,
  RelationshipEdge,
} from "./types";

const DIRECTION_SET_WIDTH = 380;
const DIRECTION_SET_ROW_HEIGHT = 260;
const DIRECTION_SET_BASE_HEIGHT = 48;

export type FacetsReactFlowGraph = {
  nodes: FacetsCanvasNode[];
  edges: RelationshipEdge[];
};

export type MapProjectFileToReactFlowOptions = {
  project?: FacetsProject;
  canvasView?: FacetsCanvasView;
  onToggleExpanded?: (artifactId: ArtifactId) => void;
  onUpdateBrief?: (artifactId: ArtifactId, patch: BriefArtifactPatch) => void;
  onUpdateDirection?: (
    artifactId: ArtifactId,
    patch: DirectionArtifactPatch,
  ) => void;
  onGenerateDirections?: (directionSetId: DirectionSetId) => void;
};

export function mapProjectFileToReactFlow(
  projectFile: FacetsProjectFile,
  options: MapProjectFileToReactFlowOptions = {},
): FacetsReactFlowGraph {
  const project = options.project ?? projectFile.project;
  const canvasView = options.canvasView ?? projectFile.canvasView;
  const directionSetByDirectionId = getDirectionSetByDirectionId(
    project.canvas.relationships,
  );

  return {
    nodes: [
      ...project.canvas.directionSets.map((directionSet) =>
        mapDirectionSetToNode(
          directionSet,
          canvasView,
          getDirectionCount(directionSet.id, project.canvas.relationships),
          isDirectionSetConnected(directionSet.id, project.canvas.relationships),
          options.onGenerateDirections,
        ),
      ),
      ...project.canvas.artifacts.map((artifact) =>
        mapArtifactToNode(
          artifact,
          canvasView,
          directionSetByDirectionId.get(artifact.id),
          options.onToggleExpanded,
          options.onUpdateBrief,
          options.onUpdateDirection,
        ),
      ),
    ],
    edges: project.canvas.relationships
      .filter((relationship) => relationship.type !== "contains_direction")
      .map(mapRelationshipToEdge),
  };
}

function mapDirectionSetToNode(
  directionSet: DirectionSet,
  canvasView: FacetsCanvasView,
  directionCount: number,
  canGenerate: boolean,
  onGenerateDirections?: (directionSetId: DirectionSetId) => void,
): DirectionGroupNode {
  const nodeView = canvasView.nodes[directionSet.id];

  return {
    id: directionSet.id,
    type: "directionGroup",
    position: nodeView.position,
    data: {
      directionSet,
      count: directionCount,
      canGenerate,
      onGenerateDirections,
    },
    draggable: false,
    selectable: false,
    zIndex: 1,
    style: {
      width: nodeView.size?.width ?? DIRECTION_SET_WIDTH,
      height:
        DIRECTION_SET_BASE_HEIGHT +
        Math.max(directionCount, 1) * DIRECTION_SET_ROW_HEIGHT,
    },
  };
}

function mapArtifactToNode(
  artifact: FacetsArtifact,
  canvasView: FacetsCanvasView,
  parentDirectionSetId: DirectionSetId | undefined,
  onToggleExpanded?: (artifactId: ArtifactId) => void,
  onUpdateBrief?: (artifactId: ArtifactId, patch: BriefArtifactPatch) => void,
  onUpdateDirection?: (
    artifactId: ArtifactId,
    patch: DirectionArtifactPatch,
  ) => void,
): ArtifactNode {
  const nodeView = canvasView.nodes[artifact.id];

  return {
    id: artifact.id,
    type: "artifact",
    position: nodeView.position,
    parentId: parentDirectionSetId,
    extent: parentDirectionSetId ? "parent" : undefined,
    data: getArtifactNodeData(
      artifact,
      Boolean(nodeView.expanded),
      onToggleExpanded,
      onUpdateBrief,
      onUpdateDirection,
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

function getDirectionSetByDirectionId(
  relationships: FacetsRelationship[],
): Map<ArtifactId, DirectionSetId> {
  const directionSetByDirectionId = new Map<ArtifactId, DirectionSetId>();

  relationships.forEach((relationship) => {
    if (relationship.type === "contains_direction") {
      directionSetByDirectionId.set(relationship.targetId, relationship.sourceId);
    }
  });

  return directionSetByDirectionId;
}

function getDirectionCount(
  directionSetId: DirectionSetId,
  relationships: FacetsRelationship[],
): number {
  return relationships.filter(
    (relationship) =>
      relationship.type === "contains_direction" &&
      relationship.sourceId === directionSetId,
  ).length;
}

function isDirectionSetConnected(
  directionSetId: DirectionSetId,
  relationships: FacetsRelationship[],
): boolean {
  return relationships.some(
    (relationship) =>
      relationship.type === "brief_to_direction_set" &&
      relationship.targetId === directionSetId,
  );
}

function getArtifactNodeData(
  artifact: FacetsArtifact,
  expanded: boolean,
  onToggleExpanded?: (artifactId: ArtifactId) => void,
  onUpdateBrief?: (artifactId: ArtifactId, patch: BriefArtifactPatch) => void,
  onUpdateDirection?: (
    artifactId: ArtifactId,
    patch: DirectionArtifactPatch,
  ) => void,
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
        onUpdateDirection,
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
    type: "relationship",
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
    case "brief_to_direction_set":
      return "Direction Set";
    case "contains_direction":
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
