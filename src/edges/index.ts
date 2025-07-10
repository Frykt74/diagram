import type { Edge, EdgeTypes } from "@xyflow/react";
import StripedEdge from "./StripedEdge";
import StepEdge from "./StepEdge";

export const initialEdges: Edge[] = [
  { id: "a->c", source: "a", target: "c", animated: true },
  { id: "b->d", source: "b", target: "d" },
  { id: "c->d", source: "c", target: "d", animated: true },
];

export const edgeTypes = {
  // Add your custom edge types here!
  step: StepEdge,
  striped: StripedEdge,
} satisfies EdgeTypes;
