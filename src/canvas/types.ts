import type { Edge, Node } from "@xyflow/react";
import type { FacetsArtifact, FacetsRelationship } from "../domain";

export type ArtifactNodeData = {
  artifact: FacetsArtifact;
  typeLabel: string;
  summary: string;
  detail: string;
};

export type ArtifactNode = Node<ArtifactNodeData, "artifact">;

export type RelationshipEdgeData = {
  relationship: FacetsRelationship;
};

export type RelationshipEdge = Edge<RelationshipEdgeData, "smoothstep">;
