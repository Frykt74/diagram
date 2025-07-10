import type { Node, BuiltInNode } from "@xyflow/react";

// Тип данных для PositionLoggerNode
export type PositionLoggerNodeData = {
  label: string;
};

// Правильное определение типа узла
export type PositionLoggerNode = Node<
  PositionLoggerNodeData,
  "position-logger"
>;

// Тип данных для кастомного узла
export type CustomNodeData = {
  label: string;
};

// Определяем тип самого узла
export type CustomNode = Node<CustomNodeData, "custom">;

// Экспортируем общий тип узлов для приложения
export type AppNode = BuiltInNode | CustomNode | PositionLoggerNode;
