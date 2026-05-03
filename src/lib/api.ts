import { invoke } from "@tauri-apps/api/core";
import type { Brief, Direction, GeneratedPrompt, PromptTarget, ProviderSettings } from "./types";

const fallbackDirections: Direction[] = [
  {
    id: "direction-quiet-system",
    title: "Quiet System",
    summary: "A restrained product interface that makes the assignment feel organized, credible, and ready for decision-making.",
    layoutIdea: "Use a compact workspace layout with a persistent left rail, a dense brief panel, and comparison cards for each concept direction.",
    whyItWorks: "It gives design leaders enough structure to review alternatives without making the experience feel like enterprise workflow software.",
    risks: "It may feel too utilitarian if the brand needs a more expressive first impression.",
    figmaNotes: "Ask the external agent to build a desktop frame first, then derive a mobile variation after the main information hierarchy is approved."
  },
  {
    id: "direction-editorial-studio",
    title: "Editorial Studio",
    summary: "A more expressive concept that treats each direction like a creative angle with sharp headlines and visual rhythm.",
    layoutIdea: "Lead with a strong project title, then stack direction blocks with evidence, intent, and execution notes.",
    whyItWorks: "It supports fuzzy early-stage exploration and makes the designer feel like they are shaping taste, not filling out a form.",
    risks: "The generated interface can drift into marketing-page composition if the prompt does not constrain it.",
    figmaNotes: "Tell the external agent to avoid hero-only outputs and include the actual working states in the first viewport."
  },
  {
    id: "direction-prompt-console",
    title: "Prompt Console",
    summary: "A focused agent-prep surface that prioritizes precise handoff prompts, sequencing, and iteration history.",
    layoutIdea: "Arrange the UI around a prompt composer, selected direction summary, and a numbered prompt sequence.",
    whyItWorks: "It makes the next action obvious and reinforces that Facets prepares the designer for external execution.",
    risks: "It may under-serve concept comparison if the prompt surface dominates too early.",
    figmaNotes: "Have the external agent create one design from the selected direction, then critique and refine in separate prompts."
  }
];

export function emptyBrief(): Brief {
  return {
    projectTitle: "Facets onboarding workspace",
    artifactType: "Mac desktop app concept",
    audience: "Product designers experimenting with Figma MCP and external AI agents",
    goal: "Help designers clarify intent, compare design directions, and generate paste-ready prompts",
    mustInclude: "Project brief, concept directions, prompt sequence, copy handoff",
    constraints: "Local-first, no direct Figma execution, lightweight, useful before model access is configured. Avoid enterprise workflow feel and one giant prompt.",
    tone: "Designer-friendly, practical, thoughtful, structured but not rigid"
  };
}

export async function getProviderSettings(): Promise<ProviderSettings> {
  try {
    return await invoke<ProviderSettings>("get_provider_settings");
  } catch {
    return { provider: "openai", model: "gpt-4.1-mini", hasApiKey: false };
  }
}

export async function generateDirections(brief: Brief): Promise<Direction[]> {
  try {
    return await invoke<Direction[]>("generate_directions", { brief });
  } catch {
    return fallbackDirections;
  }
}

export async function improveBrief(brief: Brief): Promise<Brief> {
  try {
    return await invoke<Brief>("improve_brief", { brief });
  } catch {
    return {
      ...brief,
      goal: brief.goal.trim() || "Clarify the design problem and produce a strong next action.",
      constraints: `${brief.constraints}\nKeep each generated prompt scoped to one external agent step.`.trim()
    };
  }
}

export async function generatePrompt(
  brief: Brief,
  direction: Direction | null,
  target: PromptTarget
): Promise<GeneratedPrompt> {
  try {
    return await invoke<GeneratedPrompt>("generate_prompt", { brief, direction, target });
  } catch {
    const directionTitle = direction?.title ?? "Selected direction";
    return {
      id: `prompt-${target}-${Date.now()}`,
      target,
      title: `${directionTitle} execution prompt`,
      body: buildFallbackPrompt(brief, direction, target)
    };
  }
}

function buildFallbackPrompt(brief: Brief, direction: Direction | null, target: PromptTarget): string {
  const targetLabel = target.replace("_", " ");
  return `You are helping execute a design exploration in Figma using an MCP-enabled environment.

Important boundary: Facets prepared this prompt, but Facets does not have direct Figma access. Use your own Figma MCP tools if they are available in ${targetLabel}.

Project: ${brief.projectTitle}
Artifact Type: ${brief.artifactType}
Audience: ${brief.audience}
Goal: ${brief.goal}

Must include:
${brief.mustInclude}

Constraints:
${brief.constraints}

Tone and editorial direction:
${brief.tone}

Selected concept direction:
${direction ? `${direction.title}: ${direction.summary}` : "Explore three distinct concept directions before choosing one."}

Execution notes:
${direction?.figmaNotes ?? "The user will paste this prompt into a separate MCP-enabled tool that can access Figma."}

Work in steps:
1. Inspect or establish the relevant Figma frame context.
2. Create the first design pass for the selected direction.
3. Check the result against the brief.
4. List the strongest elements, weak spots, and the next refinement prompt.`;
}
