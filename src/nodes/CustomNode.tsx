import { Handle, Position, useReactFlow, type NodeProps } from "@xyflow/react";
import { useCallback, useMemo, useRef, useEffect, useState } from "react";
import type { CustomNode } from "./types";

export function CustomNode({ id, data, selected }: NodeProps<CustomNode>) {
  const { setNodes, getEdges } = useReactFlow();
  const allEdges = getEdges();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [textDimensions, setTextDimensions] = useState({ width: 0, height: 0 });

  // Фильтруем связи, включая промежуточные
  const connectedEdges = useMemo(() => {
    return allEdges.filter((edge) => {
      if (edge.source === id || edge.target === id) {
        return true;
      }
      if (
        edge.type === "multi-segment" &&
        Array.isArray(edge.data?.nodeSequence)
      ) {
        return edge.data.nodeSequence.slice(1, -1).includes(id);
      }
      return false;
    });
  }, [allEdges, id]);

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

  // Вычисляем дополнительный размер от связей
  const extraSize = useMemo(() => {
    const baseIncrease = edgeStats.regular * 8;
    const doubleIncrease = edgeStats.double * 20;
    return baseIncrease + doubleIncrease;
  }, [edgeStats]);

  // Функция для автоматического изменения размера textarea
  const adjustTextareaSize = useCallback(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = "auto";
      textarea.style.width = "auto";

      const scrollHeight = textarea.scrollHeight;
      const scrollWidth = textarea.scrollWidth;

      const minWidth = 150;
      const minHeight = 20;
      const maxTextWidth = 200;

      let newWidth = Math.max(minWidth, scrollWidth);
      let newHeight = Math.max(minHeight, scrollHeight);

      if (newWidth > maxTextWidth) {
        newWidth = maxTextWidth;
        textarea.style.width = `${newWidth}px`;
        newHeight = Math.max(minHeight, textarea.scrollHeight);
      }

      textarea.style.width = `${newWidth}px`;
      textarea.style.height = `${newHeight}px`;
      setTextDimensions({ width: newWidth, height: newHeight });
    }
  }, []);

  const onLabelChange = useCallback(
    (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newLabel = evt.target.value;
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            return { ...node, data: { ...node.data, label: newLabel } };
          }
          return node;
        })
      );
      setTimeout(adjustTextareaSize, 0);
    },
    [id, setNodes, adjustTextareaSize]
  );

  useEffect(() => {
    adjustTextareaSize();
  }, [data.label, adjustTextareaSize]);

  // Динамические стили для узла с учетом размеров текста и цвета контура
  const nodeStyle = useMemo(() => {
    const basePadding = 15;
    const totalPadding = basePadding + extraSize;

    const baseWidth = 150;
    const baseHeight = 60;

    const nodeWidth = Math.max(
      baseWidth + extraSize * 2,
      textDimensions.width + totalPadding * 2
    );
    const nodeHeight = Math.max(
      baseHeight + extraSize,
      textDimensions.height + totalPadding * 2
    );

    return {
      padding: `${totalPadding}px`,
      width: `${nodeWidth}px`,
      height: `${nodeHeight}px`,
      minWidth: "unset",
      minHeight: "unset",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: `2px solid ${data.borderColor || "#555"}`, // Применяем пользовательский цвет
      borderRadius: "8px",
      background: "white",
      boxShadow: selected
        ? `0 0 0 2px ${data.borderColor || "#555"}`
        : "0 2px 4px rgba(0,0,0,0.1)",
    };
  }, [extraSize, textDimensions, data.borderColor, selected]);

  return (
    <div className="custom-node" style={nodeStyle}>
      <Handle type="source" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Right} id="right" />
      <Handle type="target" position={Position.Right} id="right" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="target" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Left} id="left" />
      <Handle type="target" position={Position.Left} id="left" />

      <textarea
        ref={textareaRef}
        className="custom-node-input"
        value={data.label}
        onChange={onLabelChange}
        placeholder="Введите текст"
        style={{
          border: "none",
          outline: "none",
          background: "transparent",
          resize: "none",
          overflow: "hidden",
          textAlign: "center",
          fontFamily: "inherit",
          fontSize: "inherit",
          lineHeight: "1.2",
        }}
      />
    </div>
  );
}
