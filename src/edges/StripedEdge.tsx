import { BaseEdge, getStraightPath, type EdgeProps } from "@xyflow/react";

export default function StripedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
}: EdgeProps) {
  // получаем SVG‑путь «прямой» линии
  const [edgePath] = getStraightPath({ sourceX, sourceY, targetX, targetY });

  // уникальный id для <pattern>, чтобы не пересекаться
  const patternId = `striped-pattern-${id}`;

  return (
    <>
      <defs>
        <pattern
          id={patternId}
          patternUnits="userSpaceOnUse"
          width={156} /* ширина одного полного блока (78+78) */
          height={24} /* толщина линии */
        >
          {/* первая белая прямоугольник */}
          <rect
            x={0}
            y={0}
            width={78}
            height={24}
            fill="white"
            stroke="black"
          />
          {/* вторая чёрная */}
          <rect
            x={78}
            y={0}
            width={78}
            height={24}
            fill="black"
            stroke="black"
          />
        </pattern>
      </defs>

      {/* отрисовываем сам путь, используя этот шаблон */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: `url(#${patternId})`,
          strokeWidth: 24,
          fill: "none",
        }}
      />
    </>
  );
}
