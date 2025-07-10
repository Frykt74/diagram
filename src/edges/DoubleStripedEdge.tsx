import { getSmoothStepPath, type EdgeProps } from "@xyflow/react";

export default function DoubleStripedEdge({
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

  // Создаем два разных паттерна - один смещен относительно другого
  const pattern1Id = `double-striped-pattern-1-${id}`;
  const pattern2Id = `double-striped-pattern-2-${id}`;

  return (
    <>
      <defs>
        {/* Первый паттерн - начинается с черной полоски */}
        <pattern
          id={pattern1Id}
          patternUnits="userSpaceOnUse"
          width={40}
          height={20}
        >
          <rect x="0" y="0" width="20" height="20" fill="black" />
          <rect x="20" y="0" width="20" height="20" fill="white" />
        </pattern>

        {/* Второй паттерн - смещен на одну полоску (начинается с белой) */}
        <pattern
          id={pattern2Id}
          patternUnits="userSpaceOnUse"
          width={40}
          height={20}
        >
          <rect x="0" y="0" width="20" height="20" fill="white" />
          <rect x="20" y="0" width="20" height="20" fill="black" />
        </pattern>
      </defs>

      {/* Первая линия - черная рамка */}
      <path
        d={edgePath}
        fill="none"
        stroke="black"
        strokeWidth={18}
        style={{ transform: "translateY(-9px)" }}
      />
      {/* Первая линия - полосатый паттерн */}
      <path
        d={edgePath}
        fill="none"
        stroke={`url(#${pattern1Id})`}
        strokeWidth={16}
        style={{ transform: "translateY(-9px)" }}
      />

      {/* Вторая линия - черная рамка */}
      <path
        d={edgePath}
        fill="none"
        stroke="black"
        strokeWidth={18}
        style={{ transform: "translateY(9px)" }}
      />
      {/* Вторая линия - полосатый паттерн (смещенный) */}
      <path
        d={edgePath}
        fill="none"
        stroke={`url(#${pattern2Id})`}
        strokeWidth={16}
        style={{ transform: "translateY(9px)" }}
      />
    </>
  );
}
