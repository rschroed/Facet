import { Background, Controls, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./styles.css";

function App() {
  return (
    <main className="app-shell" aria-label="Facets canvas">
      <ReactFlow nodes={[]} edges={[]} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </main>
  );
}

export default App;
