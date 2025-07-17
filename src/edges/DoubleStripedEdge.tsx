import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@xyflow/react";

export default function DoubleStripedEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps) {
  const edgeStyle = {
    strokeWidth: 16,
    fill: "none",
  };

  // 1. Рассчитываем полную ширину одной полосы с её рамкой (16px + 2px = 18px)
  const totalStripeWidth = edgeStyle.strokeWidth + 2;

  // 2. Смещение для каждой полосы, чтобы они касались друг друга (18px / 2 = 9px)
  const offset = totalStripeWidth / 2;

  // 3. Генерируем путь с острыми углами (borderRadius: 0)
  const [mainPath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 0,
  });

  // 4. Вычисляем вектор для смещения
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const length = Math.hypot(dx, dy) || 1;
  const nx = -dy / length;
  const ny = dx / length;

  const transform1 = `translate(${nx * offset}, ${ny * offset})`;
  const transform2 = `translate(${-nx * offset}, ${-ny * offset})`;

  return (
    <g>
      {/* Первая полоса, смещенная в одну сторону */}
      <g transform={transform1}>
        <BaseEdge
          path={mainPath}
          style={{
            ...edgeStyle,
            stroke: "black",
            strokeWidth: totalStripeWidth,
          }}
        />
        <BaseEdge path={mainPath} style={{ ...edgeStyle, stroke: "white" }} />
        <BaseEdge
          path={mainPath}
          style={{ ...edgeStyle, stroke: "black", strokeDasharray: "100 100" }}
        />
      </g>

      {/* Вторая полоса, смещенная в другую сторону */}
      <g transform={transform2}>
        <BaseEdge
          path={mainPath}
          style={{
            ...edgeStyle,
            stroke: "black",
            strokeWidth: totalStripeWidth,
          }}
        />
        <BaseEdge path={mainPath} style={{ ...edgeStyle, stroke: "white" }} />
        <BaseEdge
          path={mainPath}
          style={{
            ...edgeStyle,
            stroke: "black",
            strokeDasharray: "100 100",
            strokeDashoffset: 100,
          }}
        />
      </g>
    </g>
  );
}
