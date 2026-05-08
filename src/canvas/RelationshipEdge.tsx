import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";
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
  selected,
}: EdgeProps<RelationshipEdgeType>) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      {selected ? (
        <path className="relationship-edge__selection-halo" d={edgePath} />
      ) : null}
      <BaseEdge
        id={id}
        path={edgePath}
        label={label}
        className={
          selected
            ? "relationship-edge relationship-edge--selected"
            : "relationship-edge"
        }
      />
      {selected ? (
        <EdgeLabelRenderer>
          <div
            className="relationship-edge__selection-label"
            style={{
              transform: `translate(8px, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
          >
            Selected · Delete
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}

export default RelationshipEdge;
