import type { Edge } from "@xyflow/react";

export type MultiSegmentEdgeData = {
  nodeSequence: string[];
  startLabel?: string;
  endLabel?: string;
  isDashed?: boolean;
};

export type MultiSegmentEdge = Edge<MultiSegmentEdgeData>;
