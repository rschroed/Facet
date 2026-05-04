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
      ],
      relationships: [],
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
    },
  },
};
