import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@xyflow/react";

export default function StripedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const patternId = `striped-pattern-${id}`;

  return (
    <>
      <defs>
        <pattern
          id={patternId}
          patternUnits="userSpaceOnUse"
          width={40} // Увеличиваем ширину для более широких полосок
          height={20}
          // Убираем rotate(45) - полоски должны быть вертикальными
        >
          <rect x="0" y="0" width="20" height="20" fill="black" />
          <rect x="20" y="0" width="20" height="20" fill="white" />
        </pattern>
      </defs>

      {/* Основная линия с черной рамкой */}
      <BaseEdge
        id={`${id}-border`}
        path={edgePath}
        style={{ stroke: "black", strokeWidth: 18 }}
      />
      {/* Линия с полосатым паттерном */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: `url(#${patternId})`,
          strokeWidth: 16,
        }}
      />
    </>
  );
}
