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
  DirectionGroupNode,
  FacetsCanvasNode,
  RelationshipEdge,
} from "./types";

const GENERATED_DIRECTIONS_GROUP_ID = "generated-directions-group";
const GENERATED_DIRECTION_GROUP_X = 420;
const GENERATED_DIRECTION_GROUP_Y = 260;
const GENERATED_DIRECTION_GROUP_WIDTH = 380;
const GENERATED_DIRECTION_GROUP_ROW_HEIGHT = 260;
const GENERATED_DIRECTION_GROUP_BASE_HEIGHT = 48;
const generatedDirectionIdPattern = /^direction-generated-\d+$/;

export type FacetsReactFlowGraph = {
  nodes: FacetsCanvasNode[];
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

  const generatedDirectionCount = project.canvas.artifacts.filter(
    isGeneratedDirectionArtifact,
  ).length;
  const generatedDirectionRelationships = project.canvas.relationships.filter(
    (relationship) =>
      relationship.type === "brief_to_direction" &&
      isGeneratedDirectionArtifact(artifactsById.get(relationship.targetId)),
  );
  const generatedDirectionGroupEdge =
    generatedDirectionCount > 0 && generatedDirectionRelationships.length > 0
      ? [
          mapGeneratedDirectionsGroupEdge(
            generatedDirectionRelationships[0],
            options.onGenerateDirections,
          ),
        ]
      : [];
  const generatedDirectionsGroupNode =
    generatedDirectionCount > 0
      ? [mapGeneratedDirectionsGroupNode(generatedDirectionCount)]
      : [];

  return {
    nodes: [
      ...generatedDirectionsGroupNode,
      ...project.canvas.artifacts.map((artifact) =>
        mapArtifactToNode(
          artifact,
          canvasView,
          options.onToggleExpanded,
          options.onUpdateBrief,
        ),
      ),
    ],
    edges: [
      ...project.canvas.relationships
        .filter(
          (relationship) =>
            !isGeneratedDirectionArtifact(
              artifactsById.get(relationship.targetId),
            ),
        )
        .map((relationship) =>
          mapRelationshipToEdge(
            relationship,
            generatedDirectionCount === 0 &&
              relationship.id === generateDirectionsRelationshipId,
            options.onGenerateDirections,
          ),
      ),
      ...generatedDirectionGroupEdge,
    ],
  };
}

function mapArtifactToNode(
  artifact: FacetsArtifact,
  canvasView: FacetsCanvasView,
  onToggleExpanded?: (artifactId: ArtifactId) => void,
  onUpdateBrief?: (artifactId: ArtifactId, patch: BriefArtifactPatch) => void,
): ArtifactNode {
  const nodeView = canvasView.nodes[artifact.id];
  const isGeneratedDirection = isGeneratedDirectionArtifact(artifact);

  return {
    id: artifact.id,
    type: "artifact",
    position: nodeView.position,
    parentId: isGeneratedDirection ? GENERATED_DIRECTIONS_GROUP_ID : undefined,
    extent: isGeneratedDirection ? "parent" : undefined,
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

function mapGeneratedDirectionsGroupNode(
  generatedDirectionCount: number,
): DirectionGroupNode {
  return {
    id: GENERATED_DIRECTIONS_GROUP_ID,
    type: "directionGroup",
    position: {
      x: GENERATED_DIRECTION_GROUP_X,
      y: GENERATED_DIRECTION_GROUP_Y,
    },
    data: {
      title: "Generated directions",
      count: generatedDirectionCount,
    },
    draggable: false,
    selectable: false,
    zIndex: 1,
    style: {
      width: GENERATED_DIRECTION_GROUP_WIDTH,
      height:
        GENERATED_DIRECTION_GROUP_BASE_HEIGHT +
        generatedDirectionCount * GENERATED_DIRECTION_GROUP_ROW_HEIGHT,
    },
  };
}

function mapGeneratedDirectionsGroupEdge(
  relationship: FacetsRelationship,
  onGenerateDirections?: (sourceBriefId: ArtifactId) => void,
): RelationshipEdge {
  return {
    id: `relationship-${relationship.sourceId}-${GENERATED_DIRECTIONS_GROUP_ID}`,
    type: "relationship",
    source: relationship.sourceId,
    target: GENERATED_DIRECTIONS_GROUP_ID,
    label: "Generated directions",
    data: {
      relationship,
      showGenerateDirections: true,
      onGenerateDirections,
    },
    selectable: false,
    reconnectable: false,
  };
}

function isGeneratedDirectionArtifact(
  artifact: FacetsArtifact | undefined,
): boolean {
  return (
    artifact?.type === "direction" &&
    generatedDirectionIdPattern.test(artifact.id)
  );
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
