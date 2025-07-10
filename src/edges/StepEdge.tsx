import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@xyflow/react";

export default function StepEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  markerEnd,
}: EdgeProps) {
  // getSmoothStepPath вернёт [d, labelX, labelY]
  const [d] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    borderRadius: 0, // без скруглений, получится классическая ломаная
  });

  return <BaseEdge id={id} path={d} style={style} markerEnd={markerEnd} />;
}
