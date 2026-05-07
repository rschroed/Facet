import type { ChangeEvent, MouseEvent } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { getPromptTargetLabel } from "./mapFacetsToReactFlow";
import type {
  ArtifactNode as ArtifactNodeType,
  BriefArtifactPatch,
  DirectionArtifactPatch,
} from "./types";

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
      <ArtifactNodeBody data={data} />
      <Handle type="source" position={Position.Right} isConnectable={false} />
    </article>
  );
}

function ArtifactNodeBody({ data }: Pick<ArtifactNodeType, "data">) {
  if (data.artifact.type === "brief" && data.expanded) {
    return (
      <EditableBriefFields
        artifact={data.artifact}
        onUpdateBrief={data.onUpdateBrief}
      />
    );
  }

  if (data.artifact.type === "direction" && data.expanded) {
    return (
      <EditableDirectionFields
        artifact={data.artifact}
        onUpdateDirection={data.onUpdateDirection}
      />
    );
  }

  return (
    <>
      <h2 className="artifact-node__title">{data.artifact.title}</h2>
      {data.expanded ? (
        <ExpandedArtifactFields artifact={data.artifact} />
      ) : (
        <p className="artifact-node__summary">{data.summary}</p>
      )}
    </>
  );
}

function EditableBriefFields({
  artifact,
  onUpdateBrief,
}: Pick<ArtifactNodeType["data"], "onUpdateBrief"> & {
  artifact: Extract<ArtifactNodeType["data"]["artifact"], { type: "brief" }>;
}) {
  function handleChange<K extends keyof BriefArtifactPatch>(
    field: K,
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    onUpdateBrief?.(artifact.id, { [field]: event.target.value });
  }

  return (
    <div className="artifact-node__editor">
      <label className="artifact-node__edit-field">
        <span>Title</span>
        <input
          className="artifact-node__input nodrag nopan"
          type="text"
          value={artifact.title}
          onChange={(event) => handleChange("title", event)}
        />
      </label>
      <label className="artifact-node__edit-field">
        <span>Brief</span>
        <textarea
          className="artifact-node__textarea nodrag nopan"
          value={artifact.brief}
          onChange={(event) => handleChange("brief", event)}
          rows={4}
        />
      </label>
      <label className="artifact-node__edit-field">
        <span>Audience</span>
        <textarea
          className="artifact-node__textarea nodrag nopan"
          value={artifact.audience}
          onChange={(event) => handleChange("audience", event)}
          rows={2}
        />
      </label>
      <label className="artifact-node__edit-field">
        <span>Constraints</span>
        <textarea
          className="artifact-node__textarea nodrag nopan"
          value={artifact.constraints}
          onChange={(event) => handleChange("constraints", event)}
          rows={3}
        />
      </label>
    </div>
  );
}

function EditableDirectionFields({
  artifact,
  onUpdateDirection,
}: Pick<ArtifactNodeType["data"], "onUpdateDirection"> & {
  artifact: Extract<
    ArtifactNodeType["data"]["artifact"],
    { type: "direction" }
  >;
}) {
  function handleChange<K extends keyof DirectionArtifactPatch>(
    field: K,
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    onUpdateDirection?.(artifact.id, { [field]: event.target.value });
  }

  return (
    <div className="artifact-node__editor">
      <label className="artifact-node__edit-field">
        <span>Title</span>
        <input
          className="artifact-node__input nodrag nopan"
          type="text"
          value={artifact.title}
          onChange={(event) => handleChange("title", event)}
        />
      </label>
      <label className="artifact-node__edit-field">
        <span>Angle</span>
        <textarea
          className="artifact-node__textarea nodrag nopan"
          value={artifact.angle}
          onChange={(event) => handleChange("angle", event)}
          rows={3}
        />
      </label>
      <label className="artifact-node__edit-field">
        <span>Notes</span>
        <textarea
          className="artifact-node__textarea nodrag nopan"
          value={artifact.notes}
          onChange={(event) => handleChange("notes", event)}
          rows={4}
        />
      </label>
      <label className="artifact-node__edit-field">
        <span>Rationale</span>
        <textarea
          className="artifact-node__textarea nodrag nopan"
          value={artifact.rationale ?? ""}
          onChange={(event) => handleChange("rationale", event)}
          rows={3}
        />
      </label>
    </div>
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
