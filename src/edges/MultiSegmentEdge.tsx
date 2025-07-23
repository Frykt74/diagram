import {
  BaseEdge,
  EdgeLabelRenderer,
  useReactFlow,
  type EdgeProps,
  type Edge,
  Position,
} from "@xyflow/react";
import type { AppNode } from "../nodes/types";

type MultiSegmentEdgeData = {
  nodeSequence: string[];
  startLabel?: string;
  endLabel?: string;
  isDashed?: boolean;
  color?: string; // Поддержка пользовательского цвета
};

// --- Вспомогательные функции ---

function getPositionFromHandle(handleId: string | undefined): Position {
  switch (handleId) {
    case "top":
      return Position.Top;
    case "right":
      return Position.Right;
    case "bottom":
      return Position.Bottom;
    case "left":
      return Position.Left;
    default:
      return Position.Right;
  }
}

function getMainEdgeBetweenNodes(
  edges: Edge[],
  source: string,
  target: string
): Edge | undefined {
  return edges.find(
    (edge) =>
      edge.source === source &&
      edge.target === target &&
      edge.type !== "multi-segment"
  );
}

function getPortPositions(
  sourceNode: AppNode,
  targetNode: AppNode,
  edges: Edge[]
) {
  const directEdge = getMainEdgeBetweenNodes(
    edges,
    sourceNode.id,
    targetNode.id
  );
  const sourceHandle = (directEdge?.sourceHandle ?? undefined) as
    | string
    | undefined;
  const targetHandle = (directEdge?.targetHandle ?? undefined) as
    | string
    | undefined;

  if (directEdge) {
    return {
      sourcePos: getPositionFromHandle(sourceHandle),
      sourceHandle: sourceHandle ?? "right",
      targetPos: getPositionFromHandle(targetHandle),
      targetHandle: targetHandle ?? "left",
    };
  }

  const sourceCenter = {
    x: sourceNode.position.x + (sourceNode.measured?.width ?? 150) / 2,
    y: sourceNode.position.y + (sourceNode.measured?.height ?? 60) / 2,
  };
  const targetCenter = {
    x: targetNode.position.x + (targetNode.measured?.width ?? 150) / 2,
    y: targetNode.position.y + (targetNode.measured?.height ?? 60) / 2,
  };
  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;

  let sourceHandleStr: string, targetHandleStr: string;
  if (Math.abs(dx) > Math.abs(dy)) {
    sourceHandleStr = dx > 0 ? "right" : "left";
    targetHandleStr = dx > 0 ? "left" : "right";
  } else {
    sourceHandleStr = dy > 0 ? "bottom" : "top";
    targetHandleStr = dy > 0 ? "top" : "bottom";
  }

  return {
    sourcePos: getPositionFromHandle(sourceHandleStr),
    sourceHandle: sourceHandleStr,
    targetPos: getPositionFromHandle(targetHandleStr),
    targetHandle: targetHandleStr,
  };
}

// Общий счетчик для связей в обоих направлениях
function getSegmentIndex(
  allEdges: Edge[],
  currentEdgeId: string,
  sourceNodeId: string,
  targetNodeId: string
): number {
  const competingEdges = allEdges.filter((edge) => {
    // Проверяем, что это многосегментная связь
    if (edge.type !== "multi-segment") {
      return false;
    }

    const edgeData = edge.data as MultiSegmentEdgeData | undefined;

    if (!edgeData?.nodeSequence || !Array.isArray(edgeData.nodeSequence)) {
      return false;
    }

    const seq = edgeData.nodeSequence;

    for (let i = 0; i < seq.length - 1; i++) {
      if (
        (seq[i] === sourceNodeId && seq[i + 1] === targetNodeId) ||
        (seq[i] === targetNodeId && seq[i + 1] === sourceNodeId)
      ) {
        return true;
      }
    }
    return false;
  });

  // Сортируем для стабильного порядка
  competingEdges.sort((a, b) => a.id.localeCompare(b.id));

  return competingEdges.findIndex((edge) => edge.id === currentEdgeId);
}

// Логика отступов
function calcOffsetPx(idx: number, baseShift: number = 30) {
  if (idx === -1) return 0;
  const side = idx % 2 === 0 ? 1 : -1;
  const pos = Math.floor(idx / 2) + 1;
  return side * pos * baseShift;
}

function getPointWithOffset(
  base: { x: number; y: number },
  handle: string | undefined,
  offset: number
) {
  switch (handle) {
    case "top":
    case "bottom":
      return { x: base.x + offset, y: base.y };
    case "left":
    case "right":
      return { x: base.x, y: base.y + offset };
    default:
      return base;
  }
}

function getOrthogonalPathWithOffsets(
  sourcePoint: { x: number; y: number },
  sourceHandle: string,
  sourceOffset: number,
  targetPoint: { x: number; y: number },
  targetHandle: string,
  targetOffset: number
) {
  const src = getPointWithOffset(sourcePoint, sourceHandle, sourceOffset);
  const tgt = getPointWithOffset(targetPoint, targetHandle, targetOffset);

  const isHorizontal = sourceHandle === "left" || sourceHandle === "right";
  const offset = sourceOffset;
  const cornerRadius = 10; // Радиус закругления углов

  const midX = (src.x + tgt.x) / 2 + (isHorizontal ? offset : 0);
  const midY = (src.y + tgt.y) / 2 + (!isHorizontal ? offset : 0);

  let path = "";
  let startLabelPoint: { x: number; y: number };
  let endLabelPoint: { x: number; y: number };

  if (isHorizontal) {
    // Горизонтальное направление
    const corner1X = midX;
    const corner1Y = src.y;
    const corner2X = midX;
    const corner2Y = tgt.y;

    // Определяем направления для закругления
    const dx1 = corner1X - src.x;
    const dy1 = corner2Y - corner1Y;
    const dx2 = tgt.x - corner2X;

    // Рассчитываем точки для закругленных углов
    const r = Math.min(
      cornerRadius,
      Math.abs(dx1) / 2,
      Math.abs(dy1) / 2,
      Math.abs(dx2) / 2
    );

    const p1x = src.x;
    const p1y = src.y;

    const p2x = corner1X - Math.sign(dx1) * r;
    const p2y = corner1Y;

    const p3x = corner1X;
    const p3y = corner1Y + Math.sign(dy1) * r;

    const p4x = corner2X;
    const p4y = corner2Y - Math.sign(dy1) * r;

    const p5x = corner2X + Math.sign(dx2) * r;
    const p5y = corner2Y;

    const p6x = tgt.x;
    const p6y = tgt.y;

    path = `M ${p1x} ${p1y} L ${p2x} ${p2y} Q ${corner1X} ${corner1Y} ${p3x} ${p3y} L ${p4x} ${p4y} Q ${corner2X} ${corner2Y} ${p5x} ${p5y} L ${p6x} ${p6y}`;

    startLabelPoint = { x: (p2x + p3x) / 2, y: (p2y + p3y) / 2 };
    endLabelPoint = { x: (p4x + p5x) / 2, y: (p4y + p5y) / 2 };
  } else {
    // Вертикальное направление
    const corner1X = src.x;
    const corner1Y = midY;
    const corner2X = tgt.x;
    const corner2Y = midY;

    // Определяем направления для закругления
    const dy1 = corner1Y - src.y;
    const dx1 = corner2X - corner1X;
    const dy2 = tgt.y - corner2Y;

    // Рассчитываем точки для закругленных углов
    const r = Math.min(
      cornerRadius,
      Math.abs(dy1) / 2,
      Math.abs(dx1) / 2,
      Math.abs(dy2) / 2
    );

    const p1x = src.x;
    const p1y = src.y;

    const p2x = corner1X;
    const p2y = corner1Y - Math.sign(dy1) * r;

    const p3x = corner1X + Math.sign(dx1) * r;
    const p3y = corner1Y;

    const p4x = corner2X - Math.sign(dx1) * r;
    const p4y = corner2Y;

    const p5x = corner2X;
    const p5y = corner2Y + Math.sign(dy2) * r;

    const p6x = tgt.x;
    const p6y = tgt.y;

    path = `M ${p1x} ${p1y} L ${p2x} ${p2y} Q ${corner1X} ${corner1Y} ${p3x} ${p3y} L ${p4x} ${p4y} Q ${corner2X} ${corner2Y} ${p5x} ${p5y} L ${p6x} ${p6y}`;

    startLabelPoint = { x: (p2x + p3x) / 2, y: (p2y + p3y) / 2 };
    endLabelPoint = { x: (p4x + p5x) / 2, y: (p4y + p5y) / 2 };
  }

  return {
    path,
    startLabelPoint,
    endLabelPoint,
  };
}

// --- Основной компонент ---

export default function MultiSegmentEdge(props: EdgeProps) {
  const { id, data, style, markerEnd } = props;
  const { getNodes, getEdges } = useReactFlow();
  const allNodes = getNodes();
  const allEdges = getEdges();

  const edgeData = data as MultiSegmentEdgeData | undefined;
  if (!edgeData?.nodeSequence || edgeData.nodeSequence.length < 2) return null;

  const sequenceNodes = edgeData.nodeSequence
    .map((nodeId) => allNodes.find((node) => node.id === nodeId))
    .filter((node): node is AppNode => Boolean(node));
  if (sequenceNodes.length < 2) return null;

  const segments = [];
  const labels = [];

  for (let i = 0; i < sequenceNodes.length - 1; i++) {
    const sourceNode = sequenceNodes[i];
    const targetNode = sequenceNodes[i + 1];
    if (!sourceNode || !targetNode) continue;

    const { sourceHandle, targetHandle } = getPortPositions(
      sourceNode,
      targetNode,
      allEdges
    );

    const segmentIdx = getSegmentIndex(
      allEdges,
      id,
      sourceNode.id,
      targetNode.id
    );
    const offset = calcOffsetPx(segmentIdx);

    const sourceW = sourceNode.measured?.width ?? 150;
    const sourceH = sourceNode.measured?.height ?? 60;
    const targetW = targetNode.measured?.width ?? 150;
    const targetH = targetNode.measured?.height ?? 60;

    const sourceBase = {
      x:
        sourceNode.position.x +
        (sourceHandle === "left"
          ? 0
          : sourceHandle === "right"
          ? sourceW
          : sourceW / 2),
      y:
        sourceNode.position.y +
        (sourceHandle === "top"
          ? 0
          : sourceHandle === "bottom"
          ? sourceH
          : sourceH / 2),
    };
    const targetBase = {
      x:
        targetNode.position.x +
        (targetHandle === "left"
          ? 0
          : targetHandle === "right"
          ? targetW
          : targetW / 2),
      y:
        targetNode.position.y +
        (targetHandle === "top"
          ? 0
          : targetHandle === "bottom"
          ? targetH
          : targetH / 2),
    };

    const { path, startLabelPoint, endLabelPoint } =
      getOrthogonalPathWithOffsets(
        sourceBase,
        sourceHandle,
        offset,
        targetBase,
        targetHandle,
        offset
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

  // Применяем пользовательский цвет
  const edgeColor = edgeData.color || "#555";
  const edgeStyle = {
    stroke: edgeColor,
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
