import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@xyflow/react";

export default function CurvedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
}: EdgeProps) {
  // getSmoothStepPath вернёт SVG-путь и координаты для метки
  const [d] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 15,
  });

  return <BaseEdge id={id} path={d} style={style} markerEnd={markerEnd} />;
}
