import { useCallback, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
  type EdgeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { nodeTypes, initialNodes } from "../nodes";
import { edgeTypes, initialEdges } from "../edges";
import type { AppNode } from "../nodes/types";

let idCounter = 3; // Счетчик для ID новых узлов

export default function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [deleteButtonPos, setDeleteButtonPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Тип связи по умолчанию
  const [newEdgeType, setNewEdgeType] =
    useState<keyof typeof edgeTypes>("curved");

  // Добавление нового узла
  const onAddNode = useCallback(() => {
    const newId = `${idCounter++}`;
    const newNode: AppNode = {
      id: newId,
      type: "custom", // Используем кастомный тип
      position: {
        x: Math.random() * (window.innerWidth / 2),
        y: Math.random() * (window.innerHeight / 2),
      },
      data: { label: `Новый блок ${newId}` },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  // Обработчик соединения узлов
  const onConnect: OnConnect = useCallback(
    (connection) =>
      setEdges((eds) => addEdge({ ...connection, type: newEdgeType }, eds)),
    [newEdgeType, setEdges]
  );

  // Клик по связи для показа кнопки удаления
  const onEdgeClick: EdgeMouseHandler = useCallback((evt, edge) => {
    evt.stopPropagation();
    setSelectedEdgeId(edge.id);
    setDeleteButtonPos({ x: evt.clientX, y: evt.clientY });
  }, []);

  // Удаление выбранной связи
  const deleteEdge = useCallback(() => {
    if (!selectedEdgeId) return;
    setEdges((eds) => eds.filter((e) => e.id !== selectedEdgeId));
    setSelectedEdgeId(null);
    setDeleteButtonPos(null);
  }, [selectedEdgeId, setEdges]);

  // Скрытие кнопки при клике на пустое место
  const onPaneClick = useCallback(() => {
    setSelectedEdgeId(null);
    setDeleteButtonPos(null);
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {/* UI элементы управления */}
      <div
        style={{
          position: "absolute",
          zIndex: 10,
          top: 10,
          left: 10,
          background: "#f0f0f0",
          padding: 10,
          borderRadius: 5,
          display: "flex",
          gap: 15,
        }}
      >
        <div>
          <label style={{ marginRight: 8 }}>Тип связи:</label>
          <select
            value={newEdgeType}
            onChange={(e) =>
              setNewEdgeType(e.target.value as keyof typeof edgeTypes)
            }
          >
            {Object.keys(edgeTypes).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <button onClick={onAddNode}>Добавить блок</button>
      </div>

      {/* Кнопка удаления связи */}
      {deleteButtonPos && (
        <button
          style={{
            position: "absolute",
            left: deleteButtonPos.x + 10,
            top: deleteButtonPos.y + 10,
            zIndex: 20,
            background: "#ff4d4d",
            color: "white",
            border: "none",
            borderRadius: 4,
            padding: "4px 8px",
            cursor: "pointer",
          }}
          onClick={deleteEdge}
        >
          Удалить
        </button>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
