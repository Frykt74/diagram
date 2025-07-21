import { Handle, Position, useReactFlow, type NodeProps } from "@xyflow/react";
import { useCallback, useMemo, useRef, useEffect, useState } from "react";
import type { CustomNode } from "./types";

export function CustomNode({ id, data }: NodeProps<CustomNode>) {
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

      // Сбрасываем размеры для правильного измерения
      textarea.style.height = "auto";
      textarea.style.width = "auto";

      // Измеряем необходимые размеры
      const scrollHeight = textarea.scrollHeight;
      const scrollWidth = textarea.scrollWidth;

      // Минимальные размеры
      const minWidth = 150;
      const minHeight = 20;

      // Максимальная ширина до увеличения блока
      const maxTextWidth = 200;

      let newWidth = Math.max(minWidth, scrollWidth);
      let newHeight = Math.max(minHeight, scrollHeight);

      // Если текст не помещается в максимальную ширину, включаем перенос
      if (newWidth > maxTextWidth) {
        newWidth = maxTextWidth;
        // Пересчитываем высоту с учетом переноса
        textarea.style.width = `${newWidth}px`;
        newHeight = Math.max(minHeight, textarea.scrollHeight);
      }

      // Применяем размеры
      textarea.style.width = `${newWidth}px`;
      textarea.style.height = `${newHeight}px`;

      // Обновляем состояние для расчета размеров блока
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

      // Изменяем размер после обновления текста
      setTimeout(adjustTextareaSize, 0);
    },
    [id, setNodes, adjustTextareaSize]
  );

  // Автоматически подстраиваем размер при изменении текста или монтировании
  useEffect(() => {
    adjustTextareaSize();
  }, [data.label, adjustTextareaSize]);

  // Динамические стили для узла с учетом размеров текста
  const nodeStyle = useMemo(() => {
    const basePadding = 15;
    const totalPadding = basePadding + extraSize;

    // Базовые размеры
    const baseWidth = 150;
    const baseHeight = 60;

    // Размеры с учетом текста и отступов
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
    };
  }, [extraSize, textDimensions]);

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
