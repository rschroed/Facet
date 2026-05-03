import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { ArtifactNode as ArtifactNodeType } from "./types";

function ArtifactNode({ data }: NodeProps<ArtifactNodeType>) {
  return (
    <article className={`artifact-node artifact-node--${data.artifact.type}`}>
      <Handle type="target" position={Position.Left} isConnectable={false} />
      <div className="artifact-node__eyebrow">{data.typeLabel}</div>
      <h2 className="artifact-node__title">{data.artifact.title}</h2>
      <p className="artifact-node__summary">{data.summary}</p>
      <p className="artifact-node__detail">{data.detail}</p>
      <Handle type="source" position={Position.Right} isConnectable={false} />
    </article>
  );
}

export default ArtifactNode;
