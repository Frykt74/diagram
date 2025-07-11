import {
  BaseEdge,
  EdgeLabelRenderer,
  useReactFlow,
  type EdgeProps,
  Position,
} from "@xyflow/react";
import type { AppNode } from "../nodes/types";

// --- ТИПЫ ДАННЫХ ---
type MultiSegmentEdgeData = {
  nodeSequence: string[];
  startLabel?: string;
  endLabel?: string;
  isDashed?: boolean;
};

// --- ГЕОМЕТРИЧЕСКИЕ УТИЛИТЫ ---

/**
 * Определяет наиболее подходящие "виртуальные" точки подключения (хэндлы)
 * для двух блоков, основываясь на их взаимном расположении.
 */
function getPortPositions(sourceNode: AppNode, targetNode: AppNode) {
  const sourceWidth = sourceNode.measured?.width ?? 150;
  const sourceHeight = sourceNode.measured?.height ?? 60;
  const targetWidth = targetNode.measured?.width ?? 150;
  const targetHeight = targetNode.measured?.height ?? 60;

  const sourceCenter = {
    x: sourceNode.position.x + sourceWidth / 2,
    y: sourceNode.position.y + sourceHeight / 2,
  };
  const targetCenter = {
    x: targetNode.position.x + targetWidth / 2,
    y: targetNode.position.y + targetHeight / 2,
  };

  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;

  let sourcePos, targetPos;

  if (Math.abs(dx) > Math.abs(dy)) {
    sourcePos = dx > 0 ? Position.Right : Position.Left;
    targetPos = dx > 0 ? Position.Left : Position.Right;
  } else {
    sourcePos = dy > 0 ? Position.Bottom : Position.Top;
    targetPos = dy > 0 ? Position.Top : Position.Bottom;
  }

  return { sourcePos, targetPos };
}

/**
 * Главная функция: генерирует ортогональный (прямоугольный) SVG-путь
 * и рассчитывает точки для подписей со смещением.
 */
function getOrthogonalPath(
  sourceNode: AppNode,
  targetNode: AppNode,
  sourcePos: Position,
  targetPos: Position
) {
  const sourceWidth = sourceNode.measured?.width ?? 150;
  const sourceHeight = sourceNode.measured?.height ?? 60;
  const targetWidth = targetNode.measured?.width ?? 150;
  const targetHeight = targetNode.measured?.height ?? 60;

  const sourcePoint = {
    x:
      sourceNode.position.x +
      (sourcePos === Position.Left
        ? 0
        : sourcePos === Position.Right
        ? sourceWidth
        : sourceWidth / 2),
    y:
      sourceNode.position.y +
      (sourcePos === Position.Top
        ? 0
        : sourcePos === Position.Bottom
        ? sourceHeight
        : sourceHeight / 2),
  };

  const targetPoint = {
    x:
      targetNode.position.x +
      (targetPos === Position.Left
        ? 0
        : targetPos === Position.Right
        ? targetWidth
        : targetWidth / 2),
    y:
      targetNode.position.y +
      (targetPos === Position.Top
        ? 0
        : targetPos === Position.Bottom
        ? targetHeight
        : targetHeight / 2),
  };

  const KICK_OFF_DISTANCE = 30; // Расстояние "отъезда" от блока
  const points = [sourcePoint];
  let current = { ...sourcePoint };

  // Логика построения пути
  if (sourcePos === Position.Right) {
    const midX = Math.max(
      current.x + KICK_OFF_DISTANCE,
      (current.x + targetPoint.x) / 2
    );
    points.push({ x: midX, y: current.y });
    current = { x: midX, y: current.y };
    if (targetPos === Position.Left) {
      points.push({ x: current.x, y: targetPoint.y });
    }
  } else if (sourcePos === Position.Left) {
    const midX = Math.min(
      current.x - KICK_OFF_DISTANCE,
      (current.x + targetPoint.x) / 2
    );
    points.push({ x: midX, y: current.y });
    current = { x: midX, y: current.y };
    if (targetPos === Position.Right) {
      points.push({ x: current.x, y: targetPoint.y });
    }
  } else if (sourcePos === Position.Bottom) {
    const midY = Math.max(
      current.y + KICK_OFF_DISTANCE,
      (current.y + targetPoint.y) / 2
    );
    points.push({ x: current.x, y: midY });
    current = { x: current.x, y: midY };
    if (targetPos === Position.Top) {
      points.push({ x: targetPoint.x, y: current.y });
    }
  }

  points.push(targetPoint);

  // Собираем SVG-путь из точек
  const path = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");

  // Рассчитываем точки для подписей со смещением
  const LABEL_OFFSET = 20;
  const startLabelPoint = { x: points[1].x, y: points[0].y - LABEL_OFFSET };
  const endLabelPoint = {
    x: points[points.length - 2].x,
    y: points[points.length - 1].y - LABEL_OFFSET,
  };

  return { path, startLabelPoint, endLabelPoint };
}

// --- ОСНОВНОЙ КОМПОНЕНТ ---
export default function MultiSegmentEdge(props: EdgeProps) {
  const { id, data, style, markerEnd } = props;
  const { getNodes } = useReactFlow();
  const allNodes = getNodes();

  const edgeData = data as MultiSegmentEdgeData | undefined;

  if (!edgeData?.nodeSequence || edgeData.nodeSequence.length < 2) {
    return null;
  }

  const sequenceNodes = edgeData.nodeSequence
    .map((nodeId) => allNodes.find((node) => node.id === nodeId))
    .filter((node): node is AppNode => Boolean(node));

  if (sequenceNodes.length < 2) {
    return null;
  }

  const segments = [];
  const labels = [];

  for (let i = 0; i < sequenceNodes.length - 1; i++) {
    const sourceNode = sequenceNodes[i];
    const targetNode = sequenceNodes[i + 1];

    if (!sourceNode || !targetNode) continue;

    // КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ:
    // 1. Определяем лучшие "виртуальные" хэндлы для соединения.
    const { sourcePos, targetPos } = getPortPositions(sourceNode, targetNode);
    // 2. Генерируем ортогональный путь и точки для подписей.
    const { path, startLabelPoint, endLabelPoint } = getOrthogonalPath(
      sourceNode,
      targetNode,
      sourcePos,
      targetPos
    );

    segments.push(path);

    if (i === 0 && edgeData.startLabel) {
      labels.push({
        text: edgeData.startLabel,
        ...startLabelPoint,
        type: "start",
      });
    }

    if (i === sequenceNodes.length - 2 && edgeData.endLabel) {
      labels.push({ text: edgeData.endLabel, ...endLabelPoint, type: "end" });
    }
  }

  const edgeStyle = {
    stroke: "#555",
    strokeWidth: 3,
    fill: "none",
    strokeDasharray: edgeData.isDashed ? "10 5" : "none",
    ...style,
  };

  return (
    <g style={{ zIndex: 1000 }}>
      {segments.map((path, index) => (
        <BaseEdge
          key={`${id}-segment-${index}`}
          path={path}
          style={edgeStyle}
          markerEnd={index === segments.length - 1 ? markerEnd : undefined}
        />
      ))}
      <EdgeLabelRenderer>
        {labels.map((label, index) => (
          <div
            key={`${id}-label-${index}`}
            style={{
              position: "absolute",
              transform: `translate(-50%, -100%) translate(${label.x}px, ${label.y}px)`,
              background: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #ccc",
              borderRadius: "6px",
              padding: "4px 8px",
              fontSize: "11px",
              fontWeight: "600",
              color: label.type === "start" ? "#0066cc" : "#cc6600",
              pointerEvents: "none",
              zIndex: 2000,
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
          >
            {label.text}
          </div>
        ))}
      </EdgeLabelRenderer>
    </g>
  );
}
