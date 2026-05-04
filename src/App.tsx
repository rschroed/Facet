import { useCallback, useMemo, useState } from "react";
import {
  Background,
  Controls,
  ReactFlow,
  type EdgeTypes,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ArtifactNode from "./canvas/ArtifactNode";
import DirectionGroupNode from "./canvas/DirectionGroupNode";
import { mapProjectFileToReactFlow } from "./canvas/mapFacetsToReactFlow";
import RelationshipEdge from "./canvas/RelationshipEdge";
import type { BriefArtifactPatch } from "./canvas/types";
import type {
  ArtifactId,
  BriefArtifact,
  DirectionArtifact,
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
const generatedDirectionIdPattern = /^direction-generated-(\d+)$/;

const nodeTypes = {
  artifact: ArtifactNode,
  directionGroup: DirectionGroupNode,
} satisfies NodeTypes;

const edgeTypes = {
  relationship: RelationshipEdge,
} satisfies EdgeTypes;

function App() {
  const [project, setProject] = useState(staticProjectFile.project);
  const [canvasView, setCanvasView] = useState(staticProjectFile.canvasView);

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

  const handleGenerateDirections = useCallback(
    (sourceBriefId: ArtifactId) => {
      const brief = project.canvas.artifacts.find(
        (artifact): artifact is BriefArtifact =>
          artifact.id === sourceBriefId && artifact.type === "brief",
      );

      if (!brief) {
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
      const generatedRelationships: FacetsRelationship[] =
        generatedDirections.map((direction) => ({
          id: `relationship-${sourceBriefId}-${direction.id}`,
          type: "brief_to_direction",
          sourceId: sourceBriefId,
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
              const generatedIndex = existingGeneratedCount + index;

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

  const staticGraph = useMemo(
    () =>
      mapProjectFileToReactFlow(staticProjectFile, {
        project,
        canvasView,
        onToggleExpanded: handleToggleExpanded,
        onUpdateBrief: handleUpdateBrief,
        onGenerateDirections: handleGenerateDirections,
      }),
    [
      canvasView,
      handleGenerateDirections,
      handleToggleExpanded,
      handleUpdateBrief,
      project,
    ],
  );

  return (
    <main className="app-shell" aria-label="Facets canvas">
      <ReactFlow
        nodes={staticGraph.nodes}
        edges={staticGraph.edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        edgesReconnectable={false}
        deleteKeyCode={null}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </main>
  );
}

export default App;
