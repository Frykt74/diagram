import type { Edge, Viewport } from "@xyflow/react";
import type { AppNode } from "../nodes/types";

// Типы для диаграммы
export interface DiagramModel {
  id: number;
  name: string;
  description?: string;
  jsonData: string;
  svgData?: string;
  createdAt: string;
  updatedAt: string;
}

// Типы для Flow данных
export interface FlowData {
  nodes: AppNode[];
  edges: Edge[];
  viewport: Viewport;
  timestamp?: number;
}

// Типы для API запросов
export interface DiagramCreateRequest {
  name: string;
  description?: string;
  jsonData: FlowData;
  svgData?: string | null;
}

export interface DiagramUpdateRequest {
  name?: string;
  description?: string;
  jsonData?: FlowData;
  svgData?: string | null;
}
