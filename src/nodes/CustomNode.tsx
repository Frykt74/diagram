import { Handle, Position, useReactFlow, type NodeProps } from "@xyflow/react";
import { useCallback, useMemo } from "react";
import type { CustomNode } from "./types";

export function CustomNode({ id, data }: NodeProps<CustomNode>) {
  const { setNodes, getEdges } = useReactFlow();

  // Получаем все связи для текущего узла
  const edges = getEdges();
  const connectedEdges = useMemo(() => {
    return edges.filter((edge) => edge.source === id || edge.target === id);
  }, [edges, id]);

  // Подсчитываем количество разных типов связей
  const edgeStats = useMemo(() => {
    const doubleEdges = connectedEdges.filter(
      (edge) => edge.type === "double-striped"
    );
    const regularEdges = connectedEdges.filter(
      (edge) => edge.type !== "double-striped"
    );

    return {
      total: connectedEdges.length,
      double: doubleEdges.length,
      regular: regularEdges.length,
    };
  }, [connectedEdges]);

  // Вычисляем дополнительный размер
  const extraSize = useMemo(() => {
    // Базовое увеличение для каждой связи
    const baseIncrease = edgeStats.regular * 8;
    // Дополнительное увеличение для двойных связей
    const doubleIncrease = edgeStats.double * 20;

    return baseIncrease + doubleIncrease;
  }, [edgeStats]);

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

  // Динамические стили для узла
  const nodeStyle = {
    padding: `${15 + extraSize}px`,
    minWidth: `${150 + extraSize * 2}px`,
    minHeight: `${60 + extraSize}px`,
  };

  return (
    <div className="custom-node" style={nodeStyle}>
      {/* Handles для всех сторон */}
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
        placeholder="Введите текст"
      />
    </div>
  );
}
