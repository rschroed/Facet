export type TabId = "brief" | "directions" | "prompts";

export type PromptTarget = "codex" | "chatgpt" | "claude" | "cursor" | "generic_mcp";

export type Brief = {
  projectTitle: string;
  artifactType: string;
  audience: string;
  goal: string;
  mustInclude: string;
  constraints: string;
  tone: string;
};

export type Direction = {
  id: string;
  title: string;
  summary: string;
  layoutIdea: string;
  whyItWorks: string;
  risks: string;
  figmaNotes: string;
};

export type GeneratedPrompt = {
  id: string;
  target: PromptTarget;
  title: string;
  body: string;
};

export type ProviderSettings = {
  provider: "openai";
  model: string;
  hasApiKey: boolean;
};
