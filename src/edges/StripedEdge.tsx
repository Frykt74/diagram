import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@xyflow/react";

export default function StripedEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps) {
  // Используем borderRadius: 0 для создания "ступенчатого" пути
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 0,
  });

  const edgeStyle = {
    strokeWidth: 20, // Ширина полосы
    fill: "none",
  };

  return (
    <g>
      {/* 1. Слой-рамка (черный, чуть толще) */}
      <BaseEdge
        path={edgePath}
        style={{
          ...edgeStyle,
          stroke: "black",
          strokeWidth: edgeStyle.strokeWidth + 2,
        }}
      />
      {/* 2. Слой-фон (белый) */}
      <BaseEdge path={edgePath} style={{ ...edgeStyle, stroke: "white" }} />
      {/* 3. Слой-узор (черные прямоугольники) с помощью stroke-dasharray */}
      <BaseEdge
        path={edgePath}
        style={{
          ...edgeStyle,
          stroke: "black",
          // 100px черного, 100px прозрачного (виден белый фон)
          strokeDasharray: "100 100",
        }}
      />
    </g>
  );
}
