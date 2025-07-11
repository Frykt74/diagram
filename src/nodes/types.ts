import type { Node, BuiltInNode } from "@xyflow/react";
import type { MultiSegmentEdge } from "../edges/types";

// Существующие типы остаются без изменений
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

// НОВОЕ: Добавляем тип для всех связей приложения
export type AppEdge = MultiSegmentEdge;

// Обновляем общий тип узлов
export type AppNode = BuiltInNode | CustomNode | PositionLoggerNode;
