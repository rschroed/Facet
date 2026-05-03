import type { Edge, Node } from "@xyflow/react";
import type { ArtifactId, FacetsArtifact, FacetsRelationship } from "../domain";

export type ArtifactNodeData = {
  artifact: FacetsArtifact;
  typeLabel: string;
  summary: string;
  expanded: boolean;
  onToggleExpanded?: (artifactId: ArtifactId) => void;
};

export type ArtifactNode = Node<ArtifactNodeData, "artifact">;

export type RelationshipEdgeData = {
  relationship: FacetsRelationship;
};

export type RelationshipEdge = Edge<RelationshipEdgeData, "smoothstep">;
