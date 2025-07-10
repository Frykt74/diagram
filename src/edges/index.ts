import type { Edge, EdgeTypes } from "@xyflow/react";
import StripedEdge from "./StripedEdge";
import CurvedEdge from "./CurvedEdge";
import DoubleStripedEdge from "./DoubleStripedEdge";

export const initialEdges: Edge[] = [
  {
    id: "1->2",
    source: "1",
    target: "2",
    // ID
    sourceHandle: "bottom",
    targetHandle: "top",
    type: "striped",
  },
];

export const edgeTypes = {
  curved: CurvedEdge,
  striped: StripedEdge,
  "double-striped": DoubleStripedEdge,
} satisfies EdgeTypes;
