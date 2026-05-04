import { useCallback, useMemo, useState } from "react";
import { Background, Controls, ReactFlow, type NodeTypes } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ArtifactNode from "./canvas/ArtifactNode";
import { mapProjectFileToReactFlow } from "./canvas/mapFacetsToReactFlow";
import type { BriefArtifactPatch } from "./canvas/types";
import type { ArtifactId } from "./domain";
import { staticProjectFile } from "./fixtures/staticProject";
import "./styles.css";

const nodeTypes = {
  artifact: ArtifactNode,
} satisfies NodeTypes;

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

  const staticGraph = useMemo(
    () =>
      mapProjectFileToReactFlow(staticProjectFile, {
        project,
        canvasView,
        onToggleExpanded: handleToggleExpanded,
        onUpdateBrief: handleUpdateBrief,
      }),
    [canvasView, handleToggleExpanded, handleUpdateBrief, project],
  );

  return (
    <main className="app-shell" aria-label="Facets canvas">
      <ReactFlow
        nodes={staticGraph.nodes}
        edges={staticGraph.edges}
        nodeTypes={nodeTypes}
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
