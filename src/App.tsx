import { useEffect, useMemo, useState } from "react";
import {
  Clipboard,
  FileText,
  Gem,
  KeyRound,
  Layers3,
  Loader2,
  Sparkles
} from "lucide-react";
import {
  emptyBrief,
  generateDirections,
  generatePrompt,
  getProviderSettings
} from "./lib/api";
import type { Brief, Direction, GeneratedPrompt, PromptTarget, ProviderSettings, TabId } from "./lib/types";

const workflowSteps: Array<{ id: TabId; label: string; detail: string; icon: typeof FileText }> = [
  { id: "brief", label: "Brief", detail: "Clarify the assignment.", icon: FileText },
  { id: "directions", label: "Directions", detail: "Pick the strongest angle.", icon: Layers3 },
  { id: "prompts", label: "Prompts", detail: "Copy into an agent tool.", icon: Clipboard }
];

const promptTargets: Array<{ id: PromptTarget; label: string }> = [
  { id: "codex", label: "Codex" },
  { id: "chatgpt", label: "ChatGPT" },
  { id: "claude", label: "Claude" },
  { id: "cursor", label: "Cursor" },
  { id: "generic_mcp", label: "Generic MCP" }
];

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>("brief");
  const [brief, setBrief] = useState<Brief>(() => emptyBrief());
  const [directions, setDirections] = useState<Direction[]>([]);
  const [selectedDirectionId, setSelectedDirectionId] = useState<string | null>(null);
  const [target, setTarget] = useState<PromptTarget>("codex");
  const [prompt, setPrompt] = useState<GeneratedPrompt | null>(null);
  const [settings, setSettings] = useState<ProviderSettings | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  useEffect(() => {
    getProviderSettings().then(setSettings);
  }, []);

  const selectedDirection = useMemo(
    () => directions.find((direction) => direction.id === selectedDirectionId) ?? null,
    [directions, selectedDirectionId]
  );

  function updateBriefField(field: keyof Brief, value: string) {
    setBrief((current) => ({ ...current, [field]: value }));
  }

  async function handleGenerateDirections() {
    setBusyAction("directions");
    try {
      const nextDirections = await generateDirections(brief);
      setDirections(nextDirections);
      setSelectedDirectionId(nextDirections[0]?.id ?? null);
      setActiveTab("directions");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleGeneratePrompt() {
    setBusyAction("prompt");
    try {
      setPrompt(await generatePrompt(brief, selectedDirection, target));
      setActiveTab("prompts");
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark">
            <Gem size={22} />
          </div>
          <div>
            <h1>Facets</h1>
            <p>Prompt workbench for design agents</p>
          </div>
        </div>

        <WorkflowPanel
          activeTab={activeTab}
          directionsCount={directions.length}
          hasSelectedDirection={selectedDirection !== null}
          hasPrompt={prompt !== null}
          busyAction={busyAction}
          onGenerateDirections={handleGenerateDirections}
          onGeneratePrompt={handleGeneratePrompt}
          onNavigate={setActiveTab}
        />

        <section className="provider-panel" aria-label="Provider status">
          <div className="provider-heading">
            <KeyRound size={16} />
            <span>Provider</span>
          </div>
          <strong>{settings?.provider ?? "openai"}</strong>
          <p>{settings?.hasApiKey ? `${settings.model} ready` : "Add an API key when model features are needed."}</p>
        </section>
      </aside>

      <section className="workspace">
        {activeTab === "brief" && (
          <BriefView
            brief={brief}
            onChange={updateBriefField}
          />
        )}

        {activeTab === "directions" && (
          <DirectionsView
            directions={directions}
            selectedDirectionId={selectedDirectionId}
            onSelect={setSelectedDirectionId}
          />
        )}

        {activeTab === "prompts" && (
          <PromptsView
            target={target}
            prompt={prompt}
            selectedDirection={selectedDirection}
            onTargetChange={setTarget}
          />
        )}
      </section>
    </main>
  );
}

function WorkflowPanel({
  activeTab,
  directionsCount,
  hasSelectedDirection,
  hasPrompt,
  busyAction,
  onGenerateDirections,
  onGeneratePrompt,
  onNavigate
}: {
  activeTab: TabId;
  directionsCount: number;
  hasSelectedDirection: boolean;
  hasPrompt: boolean;
  busyAction: string | null;
  onGenerateDirections: () => void;
  onGeneratePrompt: () => void;
  onNavigate: (tab: TabId) => void;
}) {
  function renderNextAction(stepId: TabId) {
    if (stepId === "brief") {
      return (
        <button className="button workflow-next" type="button" onClick={onGenerateDirections}>
          {busyAction === "directions" ? <Loader2 className="spin" size={17} /> : <Sparkles size={17} />}
          Continue: Generate directions
        </button>
      );
    }

    if (stepId === "directions") {
      return (
        <button className="button workflow-next" type="button" onClick={onGeneratePrompt} disabled={!hasSelectedDirection}>
          {busyAction === "prompt" ? <Loader2 className="spin" size={17} /> : <Clipboard size={17} />}
          Continue: Generate prompt
        </button>
      );
    }

    return null;
  }

  return (
    <section className="workflow-panel" aria-label="Workflow">
      <p className="eyebrow">Workflow</p>
      <p className="workflow-note">Shape the brief, compare a few facets, then turn the strongest direction into a paste-ready prompt.</p>

      <nav className="workflow-steps" aria-label="Workspace steps">
        {workflowSteps.map((step) => (
          <div className={activeTab === step.id ? "workflow-step-group is-active" : "workflow-step-group"} key={step.id}>
            <WorkflowStep
              active={activeTab === step.id}
              done={(step.id === "brief" && directionsCount > 0) || (step.id === "directions" && hasPrompt)}
              icon={step.icon}
              label={step.label}
              detail={step.detail}
              onClick={() => onNavigate(step.id)}
            />
            {activeTab === step.id && renderNextAction(step.id)}
          </div>
        ))}
      </nav>
    </section>
  );
}

function WorkflowStep({
  active,
  done,
  icon: Icon,
  label,
  detail,
  onClick
}: {
  active: boolean;
  done: boolean;
  icon: typeof FileText;
  label: string;
  detail: string;
  onClick: () => void;
}) {
  const className = ["workflow-step", active ? "is-active" : "", done ? "is-done" : ""].filter(Boolean).join(" ");

  return (
    <button className={className} type="button" onClick={onClick}>
      <Icon className="step-icon" size={20} />
      <div>
        <strong>{label}</strong>
        <p>{detail}</p>
      </div>
    </button>
  );
}

function BriefView({
  brief,
  onChange
}: {
  brief: Brief;
  onChange: (field: keyof Brief, value: string) => void;
}) {
  return (
    <section className="editor-panel brief-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Brief</p>
          <h3>Intent and constraints</h3>
        </div>
      </div>

      <TextField label="Project title" value={brief.projectTitle} onChange={(value) => onChange("projectTitle", value)} />
      <TextField label="Artifact type" value={brief.artifactType} onChange={(value) => onChange("artifactType", value)} />
      <TextArea label="Audience" value={brief.audience} onChange={(value) => onChange("audience", value)} />
      <TextArea label="Goal" value={brief.goal} onChange={(value) => onChange("goal", value)} />
      <TextArea label="Must include" value={brief.mustInclude} onChange={(value) => onChange("mustInclude", value)} />
      <TextArea label="Constraints and avoid" value={brief.constraints} onChange={(value) => onChange("constraints", value)} />
      <TextArea label="Tone" value={brief.tone} onChange={(value) => onChange("tone", value)} />
    </section>
  );
}

function DirectionsView({
  directions,
  selectedDirectionId,
  onSelect
}: {
  directions: Direction[];
  selectedDirectionId: string | null;
  onSelect: (id: string) => void;
}) {
  if (directions.length === 0) {
    return (
      <section className="empty-state">
        <Layers3 size={32} />
        <h3>No directions yet</h3>
        <p>Use the workflow controls in the sidebar to generate concept directions from the brief.</p>
      </section>
    );
  }

  return (
    <section className="directions-workspace">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Directions</p>
          <h3>Choose a facet to turn into a prompt</h3>
        </div>
      </div>

      <div className="directions-grid">
        {directions.map((direction) => (
          <article
            key={direction.id}
            className={selectedDirectionId === direction.id ? "direction-card is-selected" : "direction-card"}
          >
            <button className="card-select" type="button" onClick={() => onSelect(direction.id)}>
              <span>{selectedDirectionId === direction.id ? "Selected" : "Select"}</span>
            </button>
            <h3>{direction.title}</h3>
            <p>{direction.summary}</p>
            <dl>
              <dt>Layout or interaction idea</dt>
              <dd>{direction.layoutIdea}</dd>
              <dt>Why it works</dt>
              <dd>{direction.whyItWorks}</dd>
              <dt>Risks or tradeoffs</dt>
              <dd>{direction.risks}</dd>
              <dt>Figma execution notes</dt>
              <dd>{direction.figmaNotes}</dd>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

function PromptsView({
  target,
  prompt,
  selectedDirection,
  onTargetChange,
}: {
  target: PromptTarget;
  prompt: GeneratedPrompt | null;
  selectedDirection: Direction | null;
  onTargetChange: (target: PromptTarget) => void;
}) {
  return (
    <section className="prompt-workspace">
      <div className="prompt-controls">
        <div>
          <p className="eyebrow">Target</p>
          <div className="segmented-control">
            {promptTargets.map((item) => (
              <button
                key={item.id}
                className={target === item.id ? "is-active" : ""}
                type="button"
                onClick={() => onTargetChange(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="prompt-layout">
        <aside className="selected-direction">
          <p className="eyebrow">Selected facet</p>
          <h3>{selectedDirection?.title ?? "No direction selected"}</h3>
          <p>{selectedDirection?.summary ?? "Generate or select a direction to make the prompt more specific."}</p>
        </aside>

        <article className="prompt-output">
          <p className="eyebrow">{prompt?.title ?? "Generated prompt"}</p>
          <pre>{prompt?.body ?? "Generate a prompt to create a paste-ready handoff for your external agent tool."}</pre>
        </article>
      </div>
    </section>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea value={value} rows={4} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
