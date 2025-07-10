import { Handle, Position, useReactFlow, type NodeProps } from "@xyflow/react";
import { useCallback } from "react";
import type { CustomNode } from "./types";

export function CustomNode({ id, data }: NodeProps<CustomNode>) {
  const { setNodes } = useReactFlow();

  const onLabelChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      const newLabel = evt.target.value;
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            return { ...node, data: { ...node.data, label: newLabel } };
          }
          return node;
        })
      );
    },
    [id, setNodes]
  );

  return (
    <div className="custom-node">
      <Handle type="source" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Top} id="top" />

      <Handle type="source" position={Position.Right} id="right" />
      <Handle type="target" position={Position.Right} id="right" />

      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="target" position={Position.Bottom} id="bottom" />

      <Handle type="source" position={Position.Left} id="left" />
      <Handle type="target" position={Position.Left} id="left" />

      <input
        className="custom-node-input"
        value={data.label}
        onChange={onLabelChange}
      />
    </div>
  );
}
