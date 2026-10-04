import type { BaseEntity } from "../../../shared/services/BaseService";

export interface SketchPoint {
  x: number;
  y: number;
}

export type SketchTool = "pen" | "eraser";

export interface SketchStroke {
  kind: "stroke";
  id: string;
  tool: SketchTool;
  color: string;
  size: number;
  points: SketchPoint[];
}

export interface SketchText {
  kind: "text";
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  size: number;
}

export type SketchElement = SketchStroke | SketchText;

// Normaliza elementos guardados antes del campo `kind`.
export const normalizeElements = (els: SketchElement[]): SketchElement[] =>
  els.map((el) =>
    el && (el as SketchText).kind === "text"
      ? el
      : ({ ...(el as SketchStroke), kind: "stroke" } as SketchStroke),
  );

export interface Sketch extends BaseEntity {
  title: string;
  strokes: SketchElement[];
  width: number;
  height: number;
  thumbnail: string;
  background: string;
}
