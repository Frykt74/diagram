import type {
  DiagramModel,
  DiagramCreateRequest,
  DiagramUpdateRequest,
} from "../types/api";

const API_BASE_URL = "http://localhost:5285/api";

export class DiagramAPI {
  static async getAll(): Promise<DiagramModel[]> {
    const response = await fetch(`${API_BASE_URL}/diagrams`);
    if (!response.ok) throw new Error("Ошибка загрузки диаграмм");
    return response.json();
  }

  static async getById(id: number): Promise<DiagramModel> {
    const response = await fetch(`${API_BASE_URL}/diagrams/${id}`);
    if (!response.ok) throw new Error("Диаграмма не найдена");
    return response.json();
  }

  static async create(data: DiagramCreateRequest): Promise<DiagramModel> {
    const response = await fetch(`${API_BASE_URL}/diagrams`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Ошибка создания диаграммы");
    return response.json();
  }

  static async update(
    id: number,
    data: DiagramUpdateRequest
  ): Promise<DiagramModel> {
    const response = await fetch(`${API_BASE_URL}/diagrams/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Ошибка обновления диаграммы");
    return response.json();
  }

  static async delete(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/diagrams/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Ошибка удаления диаграммы");
  }

  static async exportSvg(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/diagrams/${id}/export-svg`);
    if (!response.ok) throw new Error("Ошибка экспорта SVG");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "diagram.svg";
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
