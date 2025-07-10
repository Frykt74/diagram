import type { NodeTypes } from "@xyflow/react";
import { CustomNode } from "./CustomNode";
import { PositionLoggerNode } from "./PositionLoggerNode";
import type { AppNode } from "./types";

// Начальные узлы для демонстрации
export const initialNodes: AppNode[] = [
  {
    id: "1",
    type: "custom",
    position: { x: 0, y: 0 },
    data: { label: "Блок 1" },
  },
  {
    id: "2",
    type: "custom",
    position: { x: 300, y: 150 },
    data: { label: "Блок 2" },
  },
];

// Регистрируем узлы
export const nodeTypes = {
  custom: CustomNode,
  "position-logger": PositionLoggerNode,
} satisfies NodeTypes;
