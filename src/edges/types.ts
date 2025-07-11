import type { Edge } from "@xyflow/react";

// Тип данных для многосегментной стрелки
export type MultiSegmentEdgeData = {
  nodeSequence: string[];
  startLabel?: string;
  endLabel?: string;
  isDashed?: boolean;
};

// Тип многосегментной связи
export type MultiSegmentEdge = Edge<MultiSegmentEdgeData>;
