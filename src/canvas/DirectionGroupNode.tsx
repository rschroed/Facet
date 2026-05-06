import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { MouseEvent } from "react";
import type { DirectionGroupNode as DirectionGroupNodeType } from "./types";

function DirectionGroupNode({ data }: NodeProps<DirectionGroupNodeType>) {
  const buttonLabel = data.count === 0 ? "Generate directions" : "Generate more";

  function handleGenerateClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    data.onGenerateDirections?.(data.directionSet.id);
  }

  return (
    <section className="direction-group-node">
      <Handle type="target" position={Position.Left} isConnectable={false} />
      <header className="direction-group-node__header">
        <div className="direction-group-node__title">
          <span>{data.directionSet.title}</span>
          <span>{data.count}</span>
        </div>
        <button
          className="direction-group-node__action nodrag nopan"
          type="button"
          onClick={handleGenerateClick}
        >
          {buttonLabel}
        </button>
      </header>
    </section>
  );
}

export default DirectionGroupNode;
