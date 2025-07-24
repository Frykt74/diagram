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
  const [d] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 15,
  });

  // Явные стили для экспорта
  const edgeStyle = {
    stroke: style?.stroke || "#666",
    strokeWidth: style?.strokeWidth || 2,
    fill: "none",
    ...style,
  };

  return <BaseEdge id={id} path={d} style={edgeStyle} markerEnd={markerEnd} />;
}
