import type { Edge, Node } from "@xyflow/react";
import type {
  ArtifactId,
  BriefArtifact,
  DirectionSet,
  DirectionSetId,
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

export type DirectionGroupNodeData = {
  directionSet: DirectionSet;
  count: number;
  onGenerateDirections?: (directionSetId: DirectionSetId) => void;
};

export type DirectionGroupNode = Node<
  DirectionGroupNodeData,
  "directionGroup"
>;

export type FacetsCanvasNode = ArtifactNode | DirectionGroupNode;

export type RelationshipEdgeData = {
  relationship: FacetsRelationship;
};

export type RelationshipEdge = Edge<RelationshipEdgeData, "relationship">;
