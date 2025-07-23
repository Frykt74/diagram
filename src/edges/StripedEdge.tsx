import {
  BaseEdge,
  getSmoothStepPath,
  getStraightPath,
  type EdgeProps,
} from "@xyflow/react";

export default function StripedEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps) {
  // Пороговое значение для начала искривления (в пикселях)
  const CURVE_THRESHOLD = 100;

  // Вычисляем расстояние между точками
  const distance = Math.sqrt(
    Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2)
  );

  // Выбираем тип пути в зависимости от расстояния
  const [edgePath] =
    distance > CURVE_THRESHOLD
      ? getSmoothStepPath({
          sourceX,
          sourceY,
          sourcePosition,
          targetX,
          targetY,
          targetPosition,
          borderRadius: 0,
        })
      : getStraightPath({
          sourceX,
          sourceY,
          targetX,
          targetY,
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
          strokeDasharray: "100 100",
        }}
      />
    </g>
  );
}
