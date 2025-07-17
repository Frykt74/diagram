import type { Node, BuiltInNode } from "@xyflow/react";
import type { MultiSegmentEdge } from "../edges/types";

export type PositionLoggerNodeData = {
  label: string;
};

export type PositionLoggerNode = Node<
  PositionLoggerNodeData,
  "position-logger"
>;

export type CustomNodeData = {
  label: string;
};

export type CustomNode = Node<CustomNodeData, "custom">;

export type AppEdge = MultiSegmentEdge;

export type AppNode = BuiltInNode | CustomNode | PositionLoggerNode;
