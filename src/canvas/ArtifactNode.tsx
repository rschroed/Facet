import type { MouseEvent } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { getPromptTargetLabel } from "./mapFacetsToReactFlow";
import type { ArtifactNode as ArtifactNodeType } from "./types";

function ArtifactNode({ data }: NodeProps<ArtifactNodeType>) {
  const toggleLabel = data.expanded ? "Collapse" : "Expand";

  function handleToggleClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    data.onToggleExpanded?.(data.artifact.id);
  }

  return (
    <article
      className={[
        "artifact-node",
        `artifact-node--${data.artifact.type}`,
        data.expanded ? "artifact-node--expanded" : "artifact-node--collapsed",
      ].join(" ")}
    >
      <Handle type="target" position={Position.Left} isConnectable={false} />
      <header className="artifact-node__header">
        <div className="artifact-node__eyebrow">{data.typeLabel}</div>
        <button
          className="artifact-node__action nodrag nopan"
          type="button"
          onClick={handleToggleClick}
        >
          {toggleLabel}
        </button>
      </header>
      <h2 className="artifact-node__title">{data.artifact.title}</h2>
      {data.expanded ? (
        <ExpandedArtifactFields artifact={data.artifact} />
      ) : (
        <p className="artifact-node__summary">{data.summary}</p>
      )}
      <Handle type="source" position={Position.Right} isConnectable={false} />
    </article>
  );
}

function ExpandedArtifactFields({
  artifact,
}: Pick<ArtifactNodeType["data"], "artifact">) {
  switch (artifact.type) {
    case "brief":
      return (
        <dl className="artifact-node__fields">
          <ReadonlyField label="Brief" value={artifact.brief} />
          <ReadonlyField label="Audience" value={artifact.audience} />
          <ReadonlyField label="Constraints" value={artifact.constraints} />
        </dl>
      );
    case "direction":
      return (
        <dl className="artifact-node__fields">
          <ReadonlyField label="Angle" value={artifact.angle} />
          <ReadonlyField label="Notes" value={artifact.notes} />
          {artifact.rationale ? (
            <ReadonlyField label="Rationale" value={artifact.rationale} />
          ) : null}
        </dl>
      );
    case "prompt":
      return (
        <dl className="artifact-node__fields">
          <ReadonlyField
            label="Target"
            value={getPromptTargetLabel(artifact.target)}
          />
          <ReadonlyField label="Summary" value={artifact.summary} />
          <ReadonlyField label="Prompt text" value={artifact.promptText} />
        </dl>
      );
  }
}

type ReadonlyFieldProps = {
  label: string;
  value: string;
};

function ReadonlyField({ label, value }: ReadonlyFieldProps) {
  return (
    <div className="artifact-node__field">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default ArtifactNode;
