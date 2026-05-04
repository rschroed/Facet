import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { DirectionGroupNode as DirectionGroupNodeType } from "./types";

function DirectionGroupNode({ data }: NodeProps<DirectionGroupNodeType>) {
  return (
    <section className="direction-group-node">
      <Handle type="target" position={Position.Left} isConnectable={false} />
      <header className="direction-group-node__header">
        <span>{data.title}</span>
        <span>{data.count}</span>
      </header>
    </section>
  );
}

export default DirectionGroupNode;
