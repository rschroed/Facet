import type { Edge, Node } from "@xyflow/react";
import type {
  ArtifactId,
  BriefArtifact,
  FacetsArtifact,
  FacetsRelationship,
} from "../domain";

export type BriefArtifactPatch = Partial<
  Pick<BriefArtifact, "title" | "brief" | "audience" | "constraints">
>;

export type ArtifactNodeData = {
  artifact: FacetsArtifact;
  typeLabel: string;
  summary: string;
  expanded: boolean;
  onToggleExpanded?: (artifactId: ArtifactId) => void;
  onUpdateBrief?: (artifactId: ArtifactId, patch: BriefArtifactPatch) => void;
};

export type ArtifactNode = Node<ArtifactNodeData, "artifact">;

export type RelationshipEdgeData = {
  relationship: FacetsRelationship;
  showGenerateDirections?: boolean;
  onGenerateDirections?: (sourceBriefId: ArtifactId) => void;
};

export type RelationshipEdge = Edge<RelationshipEdgeData, "relationship">;
