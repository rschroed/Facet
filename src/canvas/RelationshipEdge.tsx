import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";
import type { MouseEvent } from "react";
import type { RelationshipEdge as RelationshipEdgeType } from "./types";

function RelationshipEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  data,
}: EdgeProps<RelationshipEdgeType>) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  function handleGenerateClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();

    if (data?.relationship.type === "brief_to_direction") {
      data.onGenerateDirections?.(data.relationship.sourceId);
    }
  }

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        label={data?.showGenerateDirections ? undefined : label}
      />
      {data?.showGenerateDirections ? (
        <EdgeLabelRenderer>
          <div
            className="relationship-edge__label nodrag nopan"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
          >
            <button
              className="relationship-edge__button"
              type="button"
              onClick={handleGenerateClick}
            >
              Generate directions
            </button>
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}

export default RelationshipEdge;
