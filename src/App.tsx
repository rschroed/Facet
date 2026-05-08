import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  Background,
  Controls,
  Panel,
  ReactFlow,
  type Connection,
  type EdgeTypes,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ArtifactNode from "./canvas/ArtifactNode";
import DirectionGroupNode from "./canvas/DirectionGroupNode";
import { mapProjectFileToReactFlow } from "./canvas/mapFacetsToReactFlow";
import RelationshipEdge from "./canvas/RelationshipEdge";
import type {
  BriefArtifactPatch,
  DirectionArtifactPatch,
  RelationshipEdge as RelationshipEdgeType,
} from "./canvas/types";
import type {
  ArtifactId,
  BriefArtifact,
  DirectionArtifact,
  DirectionSet,
  DirectionSetId,
  FacetsProject,
  FacetsRelationship,
} from "./domain";
import { staticProjectFile } from "./fixtures/staticProject";
import "./styles.css";

const GENERATED_DIRECTIONS_PER_CLICK = 3;
const GENERATED_DIRECTION_X = 20;
const GENERATED_DIRECTION_START_Y = 64;
const GENERATED_DIRECTION_Y_GAP = 260;
const GENERATED_DIRECTION_WIDTH = 340;
const GENERATED_DIRECTION_HEIGHT = 220;
const DIRECTION_SET_X = 420;
const DIRECTION_SET_WIDTH = 380;
const DIRECTION_SET_BASE_HEIGHT = 48;
const DIRECTION_SET_ROW_HEIGHT = 260;
const DIRECTION_SET_Y_GAP = 80;
const generatedDirectionIdPattern = /^direction-generated-(\d+)$/;
const generatedDirectionSetIdPattern = /^direction-set-generated-(\d+)$/;

const nodeTypes = {
  artifact: ArtifactNode,
  directionGroup: DirectionGroupNode,
} satisfies NodeTypes;

const edgeTypes = {
  relationship: RelationshipEdge,
} satisfies EdgeTypes;

function isBriefArtifactId(
  project: FacetsProject,
  artifactId: string | null,
): artifactId is ArtifactId {
  return project.canvas.artifacts.some(
    (artifact) => artifact.id === artifactId && artifact.type === "brief",
  );
}

function isDirectionSetId(
  project: FacetsProject,
  directionSetId: string | null,
): directionSetId is DirectionSetId {
  return project.canvas.directionSets.some(
    (directionSet) => directionSet.id === directionSetId,
  );
}

function hasBriefToDirectionSetRelationship(
  project: FacetsProject,
  sourceBriefId: ArtifactId,
  targetDirectionSetId: DirectionSetId,
): boolean {
  return project.canvas.relationships.some(
    (relationship) =>
      relationship.type === "brief_to_direction_set" &&
      relationship.sourceId === sourceBriefId &&
      relationship.targetId === targetDirectionSetId,
  );
}

function canConnectBriefToDirectionSet(
  project: FacetsProject,
  sourceId: string | null,
  targetId: string | null,
): boolean {
  return (
    isBriefArtifactId(project, sourceId) &&
    isDirectionSetId(project, targetId) &&
    !hasBriefToDirectionSetRelationship(project, sourceId, targetId)
  );
}

function App() {
  const [project, setProject] = useState(staticProjectFile.project);
  const [canvasView, setCanvasView] = useState(staticProjectFile.canvasView);
  const [selectedDirectionIds, setSelectedDirectionIds] = useState<
    Set<ArtifactId>
  >(() => new Set());
  const [selectedRelationshipId, setSelectedRelationshipId] = useState<
    string | null
  >(null);

  const handleToggleExpanded = useCallback((artifactId: ArtifactId) => {
    setCanvasView((currentCanvasView) => {
      const currentNodeView = currentCanvasView.nodes[artifactId];

      return {
        ...currentCanvasView,
        nodes: {
          ...currentCanvasView.nodes,
          [artifactId]: {
            ...currentNodeView,
            expanded: !currentNodeView.expanded,
          },
        },
      };
    });
  }, []);

  const handleUpdateBrief = useCallback(
    (artifactId: ArtifactId, patch: BriefArtifactPatch) => {
      setProject((currentProject) => ({
        ...currentProject,
        canvas: {
          ...currentProject.canvas,
          artifacts: currentProject.canvas.artifacts.map((artifact) =>
            artifact.id === artifactId && artifact.type === "brief"
              ? { ...artifact, ...patch }
              : artifact,
          ),
        },
      }));
    },
    [],
  );

  const handleUpdateDirection = useCallback(
    (artifactId: ArtifactId, patch: DirectionArtifactPatch) => {
      setProject((currentProject) => ({
        ...currentProject,
        canvas: {
          ...currentProject.canvas,
          artifacts: currentProject.canvas.artifacts.map((artifact) =>
            artifact.id === artifactId && artifact.type === "direction"
              ? { ...artifact, ...patch }
              : artifact,
          ),
        },
      }));
    },
    [],
  );

  const handleToggleDirectionSelected = useCallback(
    (artifactId: ArtifactId) => {
      const isDirection = project.canvas.artifacts.some(
        (artifact) => artifact.id === artifactId && artifact.type === "direction",
      );

      if (!isDirection) {
        return;
      }

      setSelectedDirectionIds((currentSelectedDirectionIds) => {
        const nextSelectedDirectionIds = new Set(currentSelectedDirectionIds);

        if (nextSelectedDirectionIds.has(artifactId)) {
          nextSelectedDirectionIds.delete(artifactId);
        } else {
          nextSelectedDirectionIds.add(artifactId);
        }

        return nextSelectedDirectionIds;
      });
    },
    [project],
  );

  const handleClearDirectionSelection = useCallback(() => {
    setSelectedDirectionIds(new Set());
  }, []);

  const handleGenerateDirections = useCallback(
    (directionSetId: DirectionSetId) => {
      const directionSet = project.canvas.directionSets.find(
        (set) => set.id === directionSetId,
      );
      const sourceBriefRelationship = project.canvas.relationships.find(
        (relationship) =>
          relationship.type === "brief_to_direction_set" &&
          relationship.targetId === directionSetId,
      );
      const brief = project.canvas.artifacts.find(
        (artifact): artifact is BriefArtifact =>
          artifact.id === sourceBriefRelationship?.sourceId &&
          artifact.type === "brief",
      );

      if (!directionSet || !brief) {
        return;
      }

      const existingGeneratedCount = project.canvas.artifacts.filter(
        (artifact) =>
          artifact.type === "direction" &&
          generatedDirectionIdPattern.test(artifact.id),
      ).length;
      const generatedDirections: DirectionArtifact[] = Array.from(
        { length: GENERATED_DIRECTIONS_PER_CLICK },
        (_, index) => {
          const directionNumber = existingGeneratedCount + index + 1;

          return {
            id: `direction-generated-${directionNumber}`,
            type: "direction",
            title: `Generated direction ${directionNumber}`,
            angle: `A local concept angle for "${brief.title}".`,
            notes: `Placeholder direction generated from the current brief: ${brief.brief}`,
            rationale:
              "This deterministic placeholder proves the Brief-to-Direction workflow before model generation exists.",
          };
        },
      );
      const existingDirectionSetCount = project.canvas.relationships.filter(
        (relationship) =>
          relationship.type === "contains_direction" &&
          relationship.sourceId === directionSetId,
      ).length;
      const generatedRelationships: FacetsRelationship[] =
        generatedDirections.map((direction) => ({
          id: `relationship-${directionSetId}-${direction.id}`,
          type: "contains_direction",
          sourceId: directionSetId,
          targetId: direction.id,
        }));

      setProject({
        ...project,
        canvas: {
          ...project.canvas,
          artifacts: [...project.canvas.artifacts, ...generatedDirections],
          relationships: [
            ...project.canvas.relationships,
            ...generatedRelationships,
          ],
        },
      });
      setCanvasView({
        ...canvasView,
        nodes: {
          ...canvasView.nodes,
          ...Object.fromEntries(
            generatedDirections.map((direction, index) => {
              const generatedIndex = existingDirectionSetCount + index;

              return [
                direction.id,
                {
                  expanded: false,
                  position: {
                    x: GENERATED_DIRECTION_X,
                    y:
                      GENERATED_DIRECTION_START_Y +
                      generatedIndex * GENERATED_DIRECTION_Y_GAP,
                  },
                  size: {
                    width: GENERATED_DIRECTION_WIDTH,
                    height: GENERATED_DIRECTION_HEIGHT,
                  },
                },
              ];
            }),
          ),
        },
      });
    },
    [canvasView, project],
  );

  const handleCreateDirectionSet = useCallback(() => {
    const existingGeneratedSetCount = project.canvas.directionSets.filter(
      (directionSet) => generatedDirectionSetIdPattern.test(directionSet.id),
    ).length;
    const directionSetNumber = project.canvas.directionSets.length + 1;
    const directionSet: DirectionSet = {
      id: `direction-set-generated-${existingGeneratedSetCount + 1}`,
      title: `Direction Set ${directionSetNumber}`,
    };
    const nextY =
      project.canvas.directionSets.length === 0
        ? 0
        : Math.max(
            ...project.canvas.directionSets.map((existingDirectionSet) => {
              const nodeView = canvasView.nodes[existingDirectionSet.id];
              const directionCount = project.canvas.relationships.filter(
                (relationship) =>
                  relationship.type === "contains_direction" &&
                  relationship.sourceId === existingDirectionSet.id,
              ).length;
              const groupHeight =
                DIRECTION_SET_BASE_HEIGHT +
                Math.max(directionCount, 1) * DIRECTION_SET_ROW_HEIGHT;

              return nodeView.position.y + groupHeight;
            }),
          ) + DIRECTION_SET_Y_GAP;

    setProject({
      ...project,
      canvas: {
        ...project.canvas,
        directionSets: [...project.canvas.directionSets, directionSet],
      },
    });
    setCanvasView({
      ...canvasView,
      nodes: {
        ...canvasView.nodes,
        [directionSet.id]: {
          position: { x: DIRECTION_SET_X, y: nextY },
          size: {
            width: DIRECTION_SET_WIDTH,
            height:
              DIRECTION_SET_BASE_HEIGHT +
              DIRECTION_SET_ROW_HEIGHT,
          },
        },
      },
    });
  }, [canvasView, project]);

  const handleConnectBriefToDirectionSet = useCallback(
    (sourceBriefId: ArtifactId, targetDirectionSetId: DirectionSetId) => {
      setProject((currentProject) => {
        if (
          !canConnectBriefToDirectionSet(
            currentProject,
            sourceBriefId,
            targetDirectionSetId,
          )
        ) {
          return currentProject;
        }

        const relationship: FacetsRelationship = {
          id: `relationship-${sourceBriefId}-${targetDirectionSetId}`,
          type: "brief_to_direction_set",
          sourceId: sourceBriefId,
          targetId: targetDirectionSetId,
        };

        return {
          ...currentProject,
          canvas: {
            ...currentProject.canvas,
            relationships: [
              ...currentProject.canvas.relationships,
              relationship,
            ],
          },
        };
      });
    },
    [],
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (
        !canConnectBriefToDirectionSet(
          project,
          connection.source,
          connection.target,
        ) ||
        !connection.source ||
        !connection.target
      ) {
        return;
      }

      handleConnectBriefToDirectionSet(connection.source, connection.target);
    },
    [handleConnectBriefToDirectionSet, project],
  );

  const isValidConnection = useCallback(
    (connection: { source?: string | null; target?: string | null }) =>
      canConnectBriefToDirectionSet(
        project,
        connection.source ?? null,
        connection.target ?? null,
      ),
    [project],
  );

  const handleEdgesDelete = useCallback(
    (deletedEdges: RelationshipEdgeType[]) => {
      const deletedEdgeIds = new Set(deletedEdges.map((edge) => edge.id));

      setProject((currentProject) => ({
        ...currentProject,
        canvas: {
          ...currentProject.canvas,
          relationships: currentProject.canvas.relationships.filter(
            (relationship) =>
              relationship.type !== "brief_to_direction_set" ||
              !deletedEdgeIds.has(relationship.id),
          ),
        },
      }));
      setSelectedRelationshipId(null);
    },
    [],
  );

  const handleDisconnectBriefFromDirectionSet = useCallback(
    (relationshipId: string) => {
      setProject((currentProject) => ({
        ...currentProject,
        canvas: {
          ...currentProject.canvas,
          relationships: currentProject.canvas.relationships.filter(
            (relationship) =>
              relationship.id !== relationshipId ||
              relationship.type !== "brief_to_direction_set",
          ),
        },
      }));
      setSelectedRelationshipId(null);
    },
    [],
  );

  const handleEdgeClick = useCallback(
    (
      event: ReactMouseEvent<Element>,
      edge: RelationshipEdgeType,
    ) => {
      event.stopPropagation();
      setSelectedRelationshipId(
        edge.data?.relationship.type === "brief_to_direction_set"
          ? edge.data.relationship.id
          : null,
      );
    },
    [],
  );

  const handlePaneClick = useCallback(() => {
    setSelectedRelationshipId(null);
  }, []);

  useEffect(() => {
    function handleWindowKeyDown(event: KeyboardEvent) {
      if (
        !selectedRelationshipId ||
        (event.key !== "Delete" && event.key !== "Backspace")
      ) {
        return;
      }

      event.preventDefault();
      handleDisconnectBriefFromDirectionSet(selectedRelationshipId);
    }

    window.addEventListener("keydown", handleWindowKeyDown);

    return () => {
      window.removeEventListener("keydown", handleWindowKeyDown);
    };
  }, [handleDisconnectBriefFromDirectionSet, selectedRelationshipId]);

  const staticGraph = useMemo(
    () =>
      mapProjectFileToReactFlow(staticProjectFile, {
        project,
        canvasView,
        onToggleExpanded: handleToggleExpanded,
        onUpdateBrief: handleUpdateBrief,
        onUpdateDirection: handleUpdateDirection,
        selectedDirectionIds,
        onToggleDirectionSelected: handleToggleDirectionSelected,
        onGenerateDirections: handleGenerateDirections,
        selectedRelationshipId,
      }),
    [
      canvasView,
      handleGenerateDirections,
      handleToggleExpanded,
      handleUpdateBrief,
      handleUpdateDirection,
      handleToggleDirectionSelected,
      project,
      selectedDirectionIds,
      selectedRelationshipId,
    ],
  );

  const selectedDirectionCount = selectedDirectionIds.size;
  const selectedDirectionCountLabel =
    selectedDirectionCount === 1
      ? "1 direction selected"
      : `${selectedDirectionCount} directions selected`;

  return (
    <main className="app-shell" aria-label="Facets canvas">
      <ReactFlow
        nodes={staticGraph.nodes}
        edges={staticGraph.edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onConnect={handleConnect}
        isValidConnection={isValidConnection}
        onEdgesDelete={handleEdgesDelete}
        onEdgeClick={handleEdgeClick}
        onPaneClick={handlePaneClick}
        fitView
        nodesDraggable={false}
        nodesConnectable
        elementsSelectable
        edgesReconnectable={false}
        deleteKeyCode={["Backspace", "Delete"]}
      >
        <Panel position="top-left" className="canvas-toolbar">
          <button
            className="canvas-toolbar__button nodrag nopan"
            type="button"
            onClick={handleCreateDirectionSet}
          >
            New direction set
          </button>
          <span className="canvas-toolbar__status">
            {selectedDirectionCountLabel}
          </span>
          <button
            className="canvas-toolbar__button canvas-toolbar__button--secondary nodrag nopan"
            type="button"
            disabled={selectedDirectionCount === 0}
            onClick={handleClearDirectionSelection}
          >
            Clear selection
          </button>
        </Panel>
        <Background />
        <Controls />
      </ReactFlow>
    </main>
  );
}

export default App;
