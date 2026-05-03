import { Background, Controls, ReactFlow, type NodeTypes } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ArtifactNode from "./canvas/ArtifactNode";
import { mapProjectFileToReactFlow } from "./canvas/mapFacetsToReactFlow";
import { staticProjectFile } from "./fixtures/staticProject";
import "./styles.css";

const nodeTypes = {
  artifact: ArtifactNode,
} satisfies NodeTypes;

const staticGraph = mapProjectFileToReactFlow(staticProjectFile);

function App() {
  return (
    <main className="app-shell" aria-label="Facets canvas">
      <ReactFlow
        nodes={staticGraph.nodes}
        edges={staticGraph.edges}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
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
