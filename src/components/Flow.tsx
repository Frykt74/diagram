import { useCallback, useState, useEffect, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type OnConnect,
  type EdgeMouseHandler,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { toPng, toSvg } from "html-to-image";

import { nodeTypes, initialNodes } from "../nodes";
import { edgeTypes, initialEdges } from "../edges";
import type { AppNode } from "../nodes/types";
import { DiagramAPI } from "../services/DiagramAPI";
import type { DiagramModel, FlowData } from "../types/api";

let idCounter = 3;
const AUTOSAVE_KEY = "react-flow-autosave";

// Предустановленные цвета
const COLOR_PALETTE = [
  "#7D8A9C", // Мягкий серо-синий (по умолчанию)
  "#E57373", // Пастельный красный
  "#81C784", // Нежный зеленый
  "#64B5F6", // Светло-синий
  "#FFF176", // Пастельный желтый
  "#F06292", // Мягкий розовый
  "#4DD0E1", // Бирюзовый
  "#FFB74D", // Пастельный оранжевый
  "#BA68C8", // Лавандовый
  "#A1887F", // Теплый коричневый
  "#90A4AE", // Холодный серый
  "#455A64", // Темно-серый
];

export default function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { getViewport, setViewport } = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [deleteButtonPos, setDeleteButtonPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Состояние для создания многосегментных стрелок
  const [isCreatingMultiSegment, setIsCreatingMultiSegment] = useState(false);
  const [selectedNodesForArrow, setSelectedNodesForArrow] = useState<string[]>(
    []
  );
  const [arrowStartLabel, setArrowStartLabel] = useState("");
  const [arrowEndLabel, setArrowEndLabel] = useState("");
  const [isArrowDashed, setIsArrowDashed] = useState(false);

  // Тип связи по умолчанию
  const [newEdgeType, setNewEdgeType] =
    useState<keyof typeof edgeTypes>("curved");

  // состояния для сохранения
  const [savedDiagrams, setSavedDiagrams] = useState<DiagramModel[]>([]);
  const [currentDiagramId, setCurrentDiagramId] = useState<number | null>(null);
  const [diagramName, setDiagramName] = useState("Новая диаграмма");
  const [isLoading, setIsLoading] = useState(false);

  // Состояния для работы с цветами
  const [selectedNodeColor, setSelectedNodeColor] = useState("#555555");
  const [selectedEdgeColor, setSelectedEdgeColor] = useState("#555555");
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);

  // Автосохранение в localStorage при изменениях
  useEffect(() => {
    const flowData: FlowData = {
      nodes,
      edges,
      viewport: getViewport(),
      timestamp: Date.now(),
    };
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(flowData));
  }, [nodes, edges, getViewport]);

  // Загрузка автосохраненных данных при запуске
  useEffect(() => {
    const savedData = localStorage.getItem(AUTOSAVE_KEY);
    if (savedData) {
      try {
        const flowData: FlowData = JSON.parse(savedData);
        if (flowData.nodes && flowData.edges) {
          setNodes(flowData.nodes);
          setEdges(flowData.edges);
          if (flowData.viewport) {
            setViewport(flowData.viewport);
          }
        }
      } catch (error) {
        console.error("Ошибка загрузки автосохранения:", error);
      }
    }
  }, [setNodes, setEdges, setViewport]);

  // Загрузка списка сохраненных диаграмм
  useEffect(() => {
    loadSavedDiagrams();
  }, []);

  const loadSavedDiagrams = async () => {
    try {
      const diagrams = await DiagramAPI.getAll();
      setSavedDiagrams(diagrams);
    } catch (error) {
      console.error("Ошибка загрузки диаграмм:", error);
    }
  };

  // Сохранение диаграммы в базу данных
  const saveDiagram = useCallback(async () => {
    setIsLoading(true);
    try {
      const flowData: FlowData = {
        nodes,
        edges,
        viewport: getViewport(),
      };

      // Генерируем SVG
      let svgData: string | null = null;
      if (reactFlowWrapper.current) {
        try {
          svgData = await toSvg(reactFlowWrapper.current, {
            filter: (node) => !node.classList?.contains("react-flow__controls"),
            backgroundColor: "#ffffff",
          });
        } catch (error) {
          console.warn("Не удалось сгенерировать SVG:", error);
        }
      }

      if (currentDiagramId) {
        // Обновляем существующую диаграмму
        await DiagramAPI.update(currentDiagramId, {
          name: diagramName,
          jsonData: flowData,
          svgData,
        });
      } else {
        // Создаем новую диаграмму
        const newDiagram = await DiagramAPI.create({
          name: diagramName,
          jsonData: flowData,
          svgData,
        });
        setCurrentDiagramId(newDiagram.id);
      }

      await loadSavedDiagrams();
      alert("Диаграмма успешно сохранена!");
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      alert("Ошибка при сохранении диаграммы");
    } finally {
      setIsLoading(false);
    }
  }, [nodes, edges, getViewport, currentDiagramId, diagramName]);

  // Загрузка диаграммы из базы данных
  const loadDiagram = useCallback(
    async (diagramId: number) => {
      setIsLoading(true);
      try {
        const diagram = await DiagramAPI.getById(diagramId);
        const flowData: FlowData = JSON.parse(diagram.jsonData);

        setNodes(flowData.nodes || []);
        setEdges(flowData.edges || []);
        setCurrentDiagramId(diagram.id);
        setDiagramName(diagram.name);

        if (flowData.viewport) {
          setViewport(flowData.viewport);
        }
      } catch (error) {
        console.error("Ошибка загрузки диаграммы:", error);
        alert("Ошибка при загрузке диаграммы");
      } finally {
        setIsLoading(false);
      }
    },
    [setNodes, setEdges, setViewport]
  );

  // Экспорт в SVG
  const exportSvg = useCallback(async () => {
    if (reactFlowWrapper.current) {
      try {
        const svgData = await toSvg(reactFlowWrapper.current, {
          filter: (node) => !node.classList?.contains("react-flow__controls"),
          backgroundColor: "#ffffff",
        });

        const link = document.createElement("a");
        link.download = `${diagramName}.svg`;
        link.href = svgData;
        link.click();
      } catch (error) {
        console.error("Ошибка экспорта SVG:", error);
        alert("Ошибка при экспорте в SVG");
      }
    }
  }, [diagramName]);

  // Экспорт в PNG
  const exportPng = useCallback(async () => {
    if (reactFlowWrapper.current) {
      try {
        const pngData = await toPng(reactFlowWrapper.current, {
          filter: (node) => !node.classList?.contains("react-flow__controls"),
          backgroundColor: "#ffffff",
        });

        const link = document.createElement("a");
        link.download = `${diagramName}.png`;
        link.href = pngData;
        link.click();
      } catch (error) {
        console.error("Ошибка экспорта PNG:", error);
        alert("Ошибка при экспорте в PNG");
      }
    }
  }, [diagramName]);

  // Создание новой диаграммы
  const createNewDiagram = useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setCurrentDiagramId(null);
    setDiagramName("Новая диаграмма");
    localStorage.removeItem(AUTOSAVE_KEY);
  }, [setNodes, setEdges]);

  // Добавление нового узла
  const onAddNode = useCallback(() => {
    const newId = `${idCounter++}`;
    const newNode: AppNode = {
      id: newId,
      type: "custom",
      position: {
        x: Math.random() * (window.innerWidth / 2),
        y: Math.random() * (window.innerHeight / 2),
      },
      data: {
        label: `Новый блок ${newId}`,
        borderColor: selectedNodeColor,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes, selectedNodeColor]);

  const applyNodeColor = useCallback(() => {
    if (selectedNodeIds.length === 0) {
      alert("Выберите узлы для изменения цвета");
      return;
    }

    setNodes((nodes) =>
      nodes.map((node) => {
        if (selectedNodeIds.includes(node.id) && node.type === "custom") {
          return {
            ...node,
            data: { ...node.data, borderColor: selectedNodeColor },
          } as AppNode;
        }
        return node;
      })
    );

    setSelectedNodeIds([]);
  }, [selectedNodeIds, selectedNodeColor, setNodes]);

  // Обработчик соединения узлов
  const onConnect: OnConnect = useCallback(
    (connection) =>
      setEdges((eds) => addEdge({ ...connection, type: newEdgeType }, eds)),
    [newEdgeType, setEdges]
  );

  // Обработчик клика по узлу для создания многосегментной стрелки
  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: AppNode) => {
      if (isCreatingMultiSegment) {
        event.stopPropagation();
        setSelectedNodesForArrow((prev) => {
          if (prev.includes(node.id)) {
            return prev.filter((id) => id !== node.id);
          } else {
            return [...prev, node.id];
          }
        });
      } else {
        // Обычный режим - выбор узлов для изменения цвета
        if (node.type === "custom") {
          event.stopPropagation();
          setSelectedNodeIds((prev) => {
            if (prev.includes(node.id)) {
              return prev.filter((id) => id !== node.id);
            } else {
              return [...prev, node.id];
            }
          });
        }
      }
    },
    [isCreatingMultiSegment]
  );

  // Создание многосегментной стрелки
  const createMultiSegmentArrow = useCallback(() => {
    if (selectedNodesForArrow.length < 2) {
      alert("Выберите минимум 2 блока для создания стрелки");
      return;
    }

    const newEdge = {
      id: `multi-${Date.now()}`,
      source: selectedNodesForArrow[0],
      target: selectedNodesForArrow[selectedNodesForArrow.length - 1],
      type: "multi-segment",
      zIndex: 1000,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: selectedEdgeColor,
      },
      data: {
        nodeSequence: selectedNodesForArrow,
        startLabel: arrowStartLabel || undefined,
        endLabel: arrowEndLabel || undefined,
        isDashed: isArrowDashed,
        color: selectedEdgeColor,
      },
    };

    setEdges((eds) => [...eds, newEdge]);

    // Сбрасываем состояние
    setSelectedNodesForArrow([]);
    setArrowStartLabel("");
    setArrowEndLabel("");
    setIsArrowDashed(false);
    setIsCreatingMultiSegment(false);
  }, [
    selectedNodesForArrow,
    arrowStartLabel,
    arrowEndLabel,
    isArrowDashed,
    selectedEdgeColor,
    setEdges,
  ]);

  // Отмена создания многосегментной стрелки
  const cancelMultiSegmentCreation = useCallback(() => {
    setIsCreatingMultiSegment(false);
    setSelectedNodesForArrow([]);
    setArrowStartLabel("");
    setArrowEndLabel("");
    setIsArrowDashed(false);
  }, []);

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
    setSelectedNodeIds([]); // Сбрасываем выбор узлов
  }, []);

  // Компонент палитры цветов
  const ColorPalette = ({
    selectedColor,
    onColorSelect,
    title,
  }: {
    selectedColor: string;
    onColorSelect: (color: string) => void;
    title: string;
  }) => (
    <div style={{ marginBottom: 10 }}>
      <h5 style={{ margin: "0 0 8px 0", fontSize: "12px" }}>{title}</h5>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 4,
          maxWidth: 200,
        }}
      >
        {COLOR_PALETTE.map((color) => (
          <button
            key={color}
            onClick={() => onColorSelect(color)}
            style={{
              width: 24,
              height: 24,
              backgroundColor: color,
              border:
                selectedColor === color ? "3px solid #000" : "1px solid #ccc",
              borderRadius: 4,
              cursor: "pointer",
              padding: 0,
            }}
            title={color}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {/* Правая панель - сохранение и загрузка */}
      <div
        style={{
          position: "absolute",
          zIndex: 10,
          top: 10,
          right: 10,
          background: "#f0f0f0",
          padding: 10,
          borderRadius: 5,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          minWidth: 250,
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <h4 style={{ margin: "0 0 10px 0" }}>Сохранение и загрузка</h4>

        <div>
          <label>
            Название диаграммы:
            <input
              type="text"
              value={diagramName}
              onChange={(e) => setDiagramName(e.target.value)}
              style={{ width: "100%", padding: "4px", marginTop: "4px" }}
            />
          </label>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={saveDiagram}
            disabled={isLoading}
            style={{
              background: "#2196F3",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: "4px",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {currentDiagramId ? "Обновить" : "Сохранить"}
          </button>

          <button
            onClick={createNewDiagram}
            style={{
              background: "#2196F3",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Новая
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={exportSvg}
            style={{
              background: "#2196F3",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Экспорт SVG
          </button>

          <button
            onClick={exportPng}
            style={{
              background: "#2196F3",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Экспорт PNG
          </button>
        </div>

        {savedDiagrams.length > 0 && (
          <div style={{ borderTop: "1px solid #ccc", paddingTop: 10 }}>
            <h5 style={{ margin: "0 0 8px 0" }}>Сохраненные диаграммы:</h5>
            <div style={{ maxHeight: 200, overflowY: "auto" }}>
              {savedDiagrams.map((diagram) => (
                <div
                  key={diagram.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "4px",
                    marginBottom: "4px",
                    background:
                      diagram.id === currentDiagramId ? "#e3f2fd" : "white",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                >
                  <span style={{ flex: 1, marginRight: 8 }}>
                    {diagram.name}
                  </span>
                  <button
                    onClick={() => loadDiagram(diagram.id)}
                    disabled={isLoading}
                    style={{
                      background: "#2196F3",
                      color: "white",
                      border: "none",
                      padding: "2px 6px",
                      borderRadius: "3px",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      fontSize: "11px",
                    }}
                  >
                    Загрузить
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Левая панель - управление и палитра цветов */}
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
          flexDirection: "column",
          gap: 10,
          minWidth: 300,
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        {/* 🎨 Палитра цветов для узлов - показывается только при выборе узлов */}
        {selectedNodeIds.length > 0 && !isCreatingMultiSegment && (
          <div style={{ borderBottom: "1px solid #ccc", paddingBottom: 10 }}>
            <h4 style={{ margin: "0 0 10px 0" }}>Цвета узлов</h4>

            <ColorPalette
              selectedColor={selectedNodeColor}
              onColorSelect={setSelectedNodeColor}
              title="Цвет контура узлов"
            />

            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: "12px", marginBottom: 4 }}>
                Выбрано узлов: {selectedNodeIds.length}
              </div>
              <button
                onClick={applyNodeColor}
                style={{
                  background: "#4CAF50",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                Применить цвет
              </button>
            </div>
          </div>
        )}

        {/* 🎨 Палитра цветов для вагонопотоков - показывается только при создании */}
        {isCreatingMultiSegment && (
          <div style={{ borderBottom: "1px solid #ccc", paddingBottom: 10 }}>
            <ColorPalette
              selectedColor={selectedEdgeColor}
              onColorSelect={setSelectedEdgeColor}
              title="Цвет вагонопотока"
            />
          </div>
        )}

        {/* Обычные связи */}
        <div style={{ display: "flex", gap: 15, alignItems: "center" }}>
          <div>
            <label style={{ marginRight: 8 }}>Тип связи:</label>
            <select
              value={newEdgeType}
              onChange={(e) =>
                setNewEdgeType(e.target.value as keyof typeof edgeTypes)
              }
              disabled={isCreatingMultiSegment}
            >
              {Object.keys(edgeTypes).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <button onClick={onAddNode} disabled={isCreatingMultiSegment}>
            Добавить блок
          </button>
        </div>

        {/* Многосегментные стрелки (вагонопотоки) */}
        <div style={{ borderTop: "1px solid #ccc", paddingTop: 10 }}>
          <h4 style={{ margin: "0 0 10px 0" }}>Вагонопотоки</h4>

          {!isCreatingMultiSegment ? (
            <button
              onClick={() => setIsCreatingMultiSegment(true)}
              style={{
                background: "#4CAF50",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Создать вагонопоток
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div>
                <strong>Выбрано станций: {selectedNodesForArrow.length}</strong>
                {selectedNodesForArrow.length > 0 && (
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    Последовательность: {selectedNodesForArrow.join(" → ")}
                  </div>
                )}
              </div>

              <div>
                <label>
                  Подпись в начале:
                  <input
                    type="text"
                    value={arrowStartLabel}
                    onChange={(e) => setArrowStartLabel(e.target.value)}
                    placeholder="350/0"
                    style={{ marginLeft: 8, padding: "2px 6px" }}
                  />
                </label>
              </div>

              <div>
                <label>
                  Подпись в конце:
                  <input
                    type="text"
                    value={arrowEndLabel}
                    onChange={(e) => setArrowEndLabel(e.target.value)}
                    placeholder="0/350"
                    style={{ marginLeft: 8, padding: "2px 6px" }}
                  />
                </label>
              </div>

              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={isArrowDashed}
                    onChange={(e) => setIsArrowDashed(e.target.checked)}
                    style={{ marginRight: 8 }}
                  />
                  Пунктирная стрелка
                </label>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={createMultiSegmentArrow}
                  disabled={selectedNodesForArrow.length < 2}
                  style={{
                    background:
                      selectedNodesForArrow.length >= 2 ? "#2196F3" : "#ccc",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    cursor:
                      selectedNodesForArrow.length >= 2
                        ? "pointer"
                        : "not-allowed",
                  }}
                >
                  Создать поток
                </button>
                <button
                  onClick={cancelMultiSegmentCreation}
                  style={{
                    background: "#f44336",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Отмена
                </button>
              </div>

              <div style={{ fontSize: "12px", color: "#666" }}>
                Кликайте по станциям в нужной последовательности
              </div>
            </div>
          )}
        </div>

        {/* Инструкция */}
        <div
          style={{
            fontSize: "12px",
            color: "#666",
            borderTop: "1px solid #ccc",
            paddingTop: 10,
          }}
        >
          <strong>Инструкция:</strong>
          <br />
          {!isCreatingMultiSegment && selectedNodeIds.length === 0 && (
            <>
              • Кликайте по блокам для выбора цвета узлов
              <br />
              • Нажмите "Создать вагонопоток" для выбора цвета стрелок
              <br />
            </>
          )}
          {selectedNodeIds.length > 0 && !isCreatingMultiSegment && (
            <>
              • Выберите цвет в палитре
              <br />
              • Нажмите "Применить цвет"
              <br />
            </>
          )}
          {isCreatingMultiSegment && (
            <>
              • Выберите цвет вагонопотока в палитре
              <br />
              • Кликайте по станциям в нужной последовательности
              <br />
            </>
          )}
        </div>
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

      {/* ReactFlow с wrapper для экспорта */}
      <div ref={reactFlowWrapper} style={{ width: "100%", height: "100%" }}>
        <ReactFlow
          nodes={nodes.map((node) => ({
            ...node,
            style: {
              ...node.style,
              border: selectedNodesForArrow.includes(node.id)
                ? "3px solid #2196F3"
                : selectedNodeIds.includes(node.id)
                ? "3px solid #FFA500"
                : undefined,
              boxShadow: selectedNodesForArrow.includes(node.id)
                ? "0 0 10px rgba(33, 150, 243, 0.5)"
                : selectedNodeIds.includes(node.id)
                ? "0 0 10px rgba(255, 165, 0, 0.5)"
                : undefined,
            },
          }))}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          elevateNodesOnSelect={false}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
