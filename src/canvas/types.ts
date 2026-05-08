import type { Edge, Node } from "@xyflow/react";
import type {
  ArtifactId,
  BriefArtifact,
  DirectionArtifact,
  DirectionSet,
  DirectionSetId,
  FacetsArtifact,
  FacetsRelationship,
} from "../domain";

export type BriefArtifactPatch = Partial<
  Pick<BriefArtifact, "title" | "brief" | "audience" | "constraints">
>;

export type DirectionArtifactPatch = Partial<
  Pick<DirectionArtifact, "title" | "angle" | "notes" | "rationale">
>;

export type ArtifactNodeData = {
  artifact: FacetsArtifact;
  typeLabel: string;
  summary: string;
  expanded: boolean;
  selected: boolean;
  canStartConnection: boolean;
  onToggleExpanded?: (artifactId: ArtifactId) => void;
  onToggleDirectionSelected?: (artifactId: ArtifactId) => void;
  onUpdateBrief?: (artifactId: ArtifactId, patch: BriefArtifactPatch) => void;
  onUpdateDirection?: (
    artifactId: ArtifactId,
    patch: DirectionArtifactPatch,
  ) => void;
};

export type ArtifactNode = Node<ArtifactNodeData, "artifact">;

export type DirectionGroupNodeData = {
  directionSet: DirectionSet;
  count: number;
  canGenerate: boolean;
  canAcceptConnection: boolean;
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
