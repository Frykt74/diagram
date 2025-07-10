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
import type { AppNode } from "../nodes/types"; // твой тип AppNode

let idCounter = 3;

export default function Flow() {
  // состояние узлов типизировано как AppNode[]
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Для удаления связи
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [deleteButtonPos, setDeleteButtonPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Выбранный тип нового ребра
  const [newEdgeType, setNewEdgeType] =
    useState<keyof typeof edgeTypes>("step");

  // Обработчик добавления узла
  const onAddNode = useCallback(() => {
    const newId = `${idCounter++}`;
    const newNode: AppNode = {
      id: newId,
      type: "default", // обязательно указываем встроенный тип
      position: {
        x: window.innerWidth / 2 - 75,
        y: window.innerHeight / 2 - 25,
      },
      data: { label: `Node ${newId}` },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  // Обработчик соединения узлов
  const onConnect: OnConnect = useCallback(
    (connection) =>
      setEdges((eds) => addEdge({ ...connection, type: newEdgeType }, eds)),
    [newEdgeType, setEdges]
  );

  // Обработчик клика по ребру (для показа кнопки удаления)
  const onEdgeClick: EdgeMouseHandler = useCallback((evt, edge) => {
    evt.stopPropagation();
    setSelectedEdgeId(edge.id);
    setDeleteButtonPos({ x: evt.clientX, y: evt.clientY });
  }, []);

  // Удаление выбранного ребра
  const deleteEdge = useCallback(() => {
    if (!selectedEdgeId) return;
    setEdges((eds) => eds.filter((e) => e.id !== selectedEdgeId));
    setSelectedEdgeId(null);
    setDeleteButtonPos(null);
  }, [selectedEdgeId, setEdges]);

  // Скрыть кнопку удаления при клике по пустому месту
  const onPaneClick = useCallback(() => {
    setSelectedEdgeId(null);
    setDeleteButtonPos(null);
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {/* Селектор типа ребра */}
      <div style={{ position: "absolute", zIndex: 10, top: 10, left: 10 }}>
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

      {/* Кнопка добавления узла */}
      <div style={{ position: "absolute", zIndex: 10, top: 10, left: 180 }}>
        <button onClick={onAddNode}>Добавить узел</button>
      </div>

      {/* Кнопка удаления связи */}
      {deleteButtonPos && (
        <button
          style={{
            position: "absolute",
            left: deleteButtonPos.x + 10,
            top: deleteButtonPos.y + 10,
            zIndex: 20,
            background: "red",
            color: "white",
            border: "none",
            borderRadius: 4,
            padding: "4px 8px",
            cursor: "pointer",
          }}
          onClick={deleteEdge}
        >
          Удалить соединение
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
