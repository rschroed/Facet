import type { FacetsProjectFile } from "../domain";

export const staticProjectFile: FacetsProjectFile = {
  app: "facets",
  schemaVersion: 1,
  project: {
    id: "project-static-homepage",
    name: "Homepage exploration",
    canvas: {
      id: "canvas-static-homepage",
      artifacts: [
        {
          id: "brief-static-homepage",
          type: "brief",
          title: "Homepage concept",
          brief:
            "Explore a clearer homepage direction for a local-first prompt workbench.",
          audience: "Product designers and design leaders",
          constraints:
            "Keep it practical, canvas-first, and focused on better prompts for design agents.",
        },
        {
          id: "direction-static-workbench",
          type: "direction",
          title: "Workbench canvas",
          angle:
            "Show the design process as connected editable artifacts instead of a form-heavy workflow.",
          notes:
            "Lead with a simple canvas that makes the path from brief to direction to prompt visible.",
          rationale:
            "The structure helps designers guide agent work without turning Facets into an execution tool.",
        },
        {
          id: "prompt-static-first-concept",
          type: "prompt",
          title: "Generate first concept",
          target: "chatgpt",
          summary:
            "Ask an external agent to create a first Figma concept from the selected direction.",
          promptText:
            "Create a homepage concept in Figma based on the brief and workbench canvas direction.",
        },
      ],
      relationships: [
        {
          id: "relationship-static-brief-direction",
          type: "brief_to_direction",
          sourceId: "brief-static-homepage",
          targetId: "direction-static-workbench",
        },
        {
          id: "relationship-static-direction-prompt",
          type: "direction_to_prompt",
          sourceId: "direction-static-workbench",
          targetId: "prompt-static-first-concept",
        },
      ],
    },
  },
  canvasView: {
    canvasId: "canvas-static-homepage",
    viewport: {
      x: 0,
      y: 0,
      zoom: 1,
    },
    nodes: {
      "brief-static-homepage": {
        expanded: false,
        position: { x: 0, y: 0 },
        size: { width: 320, height: 220 },
      },
      "direction-static-workbench": {
        expanded: false,
        position: { x: 440, y: 0 },
        size: { width: 340, height: 220 },
      },
      "prompt-static-first-concept": {
        expanded: false,
        position: { x: 900, y: 0 },
        size: { width: 340, height: 220 },
      },
    },
  },
};
