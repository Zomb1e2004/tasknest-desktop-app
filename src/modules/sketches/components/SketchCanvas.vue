<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, useTemplateRef, nextTick } from "vue";
import type { SketchStroke, SketchElement, SketchText, SketchTool, SketchPoint } from "../models/SketchModel";

const strokes = defineModel<SketchElement[]>("strokes", { default: () => [] });

const props = withDefaults(
  defineProps<{
    width?: number;
    height?: number;
    background?: string;
  }>(),
  {
    width: 1600,
    height: 1000,
    background: "#ffffff",
  },
);

const canvasRef = useTemplateRef<HTMLCanvasElement>("canvas");
const stageRef = useTemplateRef<HTMLDivElement>("stage");

// Papel adaptativo: ocupa todo el ancho y el alto visible sin scrollbar.
// La proporción lógica se deriva del espacio real (sin deformar);
// los dibujos previos se reencuadran centrados, sin distorsión ni recorte.
const paperW = ref(props.width);
const paperH = ref(props.height);
let stageObserver: ResizeObserver | null = null;
let resizeTimer: ReturnType<typeof setTimeout> | null = null;
let pendingFit = false;

const migrateToFit = (commitAfter: boolean) => {
  const el = stageRef.value;
  if (!el || drawing) {
    pendingFit = true;
    return;
  }
  pendingFit = false;
  const w = el.clientWidth;
  const h = el.clientHeight;
  if (!w || !h) return;
  const newW = 1600;
  const newH = Math.min(1600, Math.max(400, Math.round((newW * h) / w)));
  if (newW === paperW.value && Math.abs(newH - paperH.value) < 2) return;
  if (strokes.value.length > 0) {
    const s = Math.min(newW / paperW.value, newH / paperH.value);
    const ox = (newW - paperW.value * s) / 2;
    const oy = (newH - paperH.value * s) / 2;
    strokes.value = strokes.value.map((el) => {
      if (el.kind === "text") {
        const t = el as SketchText;
        return {
          ...t,
          x: t.x * s + ox,
          y: t.y * s + oy,
          size: Math.max(8, t.size * s),
        } as SketchText;
      }
      const st = el as SketchStroke;
      return {
        ...st,
        size: Math.max(1, st.size * s),
        points: st.points.map((p) => ({ x: p.x * s + ox, y: p.y * s + oy })),
      } as SketchStroke;
    });
    if (commitAfter) commit();
  }
  paperW.value = newW;
  paperH.value = newH;
  redraw();
};

// --- Estado de herramientas ---
type CanvasTool = SketchTool | "text" | "select";
const activeTool = ref<CanvasTool>("pen");
const activeColor = ref("#111111");
const activeSize = ref(8);
// El tamaño de fuente deriva del grosor seleccionado.
const textFontSize = computed(() => activeSize.value * 4);

const COLORS = [
  "#111111",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

const SIZES = [4, 8, 14, 24];
const ERASER_SIZE = 28;

// --- Historial (deshacer / rehacer por snapshots) ---
const deepCopy = (list: SketchElement[]): SketchElement[] =>
  JSON.parse(JSON.stringify(list)) as SketchElement[];

const history = ref<SketchElement[][]>([]);
const historyIndex = ref(-1);

const commit = () => {
  history.value = history.value.slice(0, historyIndex.value + 1);
  history.value.push(deepCopy(strokes.value));
  if (history.value.length > 50) history.value.shift();
  historyIndex.value = history.value.length - 1;
};

const canUndo = computed(() => historyIndex.value > 0);
const canRedo = computed(() => historyIndex.value < history.value.length - 1);

// Si había un gesto a medio camino, se consolida antes de navegar el historial.
const finalizeOpenStroke = () => {
  if (drawing) {
    drawing = false;
    currentStroke = null;
    commit();
  }
  if (movingText) {
    const m = movingText.moved;
    movingText = null;
    if (m) commit();
  }
  if (movingStroke) {
    const m = movingStroke.moved;
    movingStroke = null;
    if (m) commit();
  }
};

const undo = () => {
  finalizeOpenStroke();
  if (!canUndo.value) return;
  historyIndex.value -= 1;
  strokes.value = deepCopy(history.value[historyIndex.value]);
};

const redo = () => {
  finalizeOpenStroke();
  if (!canRedo.value) return;
  historyIndex.value += 1;
  strokes.value = deepCopy(history.value[historyIndex.value]);
};

const clearCanvas = () => {
  finalizeOpenStroke();
  if (strokes.value.length === 0) return;
  strokes.value = [];
  commit();
};

// --- Render ---
const drawOn = (ctx: CanvasRenderingContext2D, el: SketchElement) => {
  if (el.kind === "text") {
    ctx.save();
    ctx.font = `${el.size}px Manrope, sans-serif`;
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = el.color;
    ctx.fillText(el.text, el.x, el.y);
    ctx.restore();
    return;
  }
  const stroke = el as SketchStroke;
  if (stroke.points.length === 0) return;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = stroke.tool === "eraser" ? props.background : stroke.color;
  ctx.fillStyle = stroke.tool === "eraser" ? props.background : stroke.color;
  ctx.lineWidth =
    stroke.tool === "eraser" ? Math.max(stroke.size, ERASER_SIZE) : stroke.size;

  if (stroke.points.length === 1) {
    const p = stroke.points[0];
    ctx.beginPath();
    ctx.arc(p.x, p.y, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
  for (let i = 1; i < stroke.points.length - 1; i++) {
    const midX = (stroke.points[i].x + stroke.points[i + 1].x) / 2;
    const midY = (stroke.points[i].y + stroke.points[i + 1].y) / 2;
    ctx.quadraticCurveTo(stroke.points[i].x, stroke.points[i].y, midX, midY);
  }
  const last = stroke.points[stroke.points.length - 1];
  ctx.lineTo(last.x, last.y);
  ctx.stroke();
  ctx.restore();
};

const redraw = () => {
  const canvas = canvasRef.value;
  const ctx = canvas?.getContext("2d");
  if (!canvas || !ctx) return;

  const dpr = window.devicePixelRatio || 1;
  if (
    canvas.width !== Math.round(paperW.value * dpr) ||
    canvas.height !== Math.round(paperH.value * dpr)
  ) {
    canvas.width = Math.round(paperW.value * dpr);
    canvas.height = Math.round(paperH.value * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = props.background;
  ctx.fillRect(0, 0, paperW.value, paperH.value);

  for (const stroke of strokes.value) {
    drawOn(ctx, stroke);
  }
};

// El pintado siempre deriva del estado: cualquier mutación de trazos
// (dibujar, deshacer, rehacer, limpiar) reprograma un repintado.
// Así es imposible que el historial y lo visible se desincronicen.
let rafId = 0;

const requestRedraw = () => {
  if (rafId) return;
  rafId = requestAnimationFrame(() => {
    rafId = 0;
    redraw();
  });
};

watch(
  strokes,
  () => requestRedraw(),
  { deep: true },
);

// --- Dibujo con puntero ---
let drawing = false;
let currentStroke: SketchStroke | null = null;

// Texto: compositor flotante y arrastre de textos existentes.
const composer = ref<{ x: number; y: number; value: string } | null>(null);
const composerInput = useTemplateRef<HTMLInputElement>("composerInput");
let composerDone = false;
let movingText: { el: SketchText; dx: number; dy: number; moved: boolean } | null = null;
let movingStroke: { el: SketchStroke; last: SketchPoint; moved: boolean } | null = null;

watch(composer, (c) => {
  if (c) {
    composerDone = false;
    nextTick(() => composerInput.value?.focus());
  }
});

const measureTextWidth = (ctx: CanvasRenderingContext2D, el: SketchText): number => {
  ctx.save();
  ctx.font = `${el.size}px Manrope, sans-serif`;
  const w = ctx.measureText(el.text).width;
  ctx.restore();
  return w;
};

const distToSegment = (p: SketchPoint, a: SketchPoint, b: SketchPoint): number => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  let t = lenSq === 0 ? 0 : ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
};

const hitStroke = (pt: SketchPoint): SketchStroke | null => {
  for (let i = strokes.value.length - 1; i >= 0; i--) {
    const el = strokes.value[i];
    if (el.kind !== "stroke") continue;
    const st = el as SketchStroke;
    const tol = Math.max(12, st.size / 2 + 8);
    if (st.points.length === 1) {
      const p = st.points[0];
      if (Math.hypot(pt.x - p.x, pt.y - p.y) <= tol) return st;
      continue;
    }
    for (let j = 0; j < st.points.length - 1; j++) {
      if (distToSegment(pt, st.points[j], st.points[j + 1]) <= tol) return st;
    }
  }
  return null;
};

const hitText = (pt: SketchPoint): SketchText | null => {
  const ctx = canvasRef.value?.getContext("2d");
  if (!ctx) return null;
  for (let i = strokes.value.length - 1; i >= 0; i--) {
    const el = strokes.value[i];
    if (el.kind !== "text") continue;
    const t = el as SketchText;
    const w = measureTextWidth(ctx, t);
    if (
      pt.x >= t.x - 10 &&
      pt.x <= t.x + w + 10 &&
      pt.y >= t.y - t.size - 10 &&
      pt.y <= t.y + 10
    ) {
      return t;
    }
  }
  return null;
};

const commitComposer = () => {
  if (!composer.value || composerDone) return;
  composerDone = true;
  const { x, y, value } = composer.value;
  composer.value = null;
  const text = value.trim();
  if (!text) return;
  // x/y ya vienen relativos al lienzo (así se posiciona el campo),
  // solo se escalan a coordenadas lógicas, sin restar offsets de nuevo.
  const rect = canvasRef.value!.getBoundingClientRect();
  const lx = (x / rect.width) * paperW.value;
  const ly = (y / rect.height) * paperH.value;
  const el: SketchText = {
    kind: "text",
    id: crypto.randomUUID(),
    text,
    x: lx,
    y: ly,
    color: activeColor.value,
    size: textFontSize.value,
  };
  strokes.value = [...strokes.value, el];
  commit();
  activeTool.value = "pen";
};

const toLogical = (e: PointerEvent): SketchPoint => {
  const rect = canvasRef.value!.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / rect.width) * paperW.value,
    y: ((e.clientY - rect.top) / rect.height) * paperH.value,
  };
};

const onPointerDown = (e: PointerEvent) => {
  if (e.pointerType === "mouse" && e.button !== 0) return;
  e.preventDefault();
  if (composer.value) commitComposer();
  if (activeTool.value === "select") {
    const pt = toLogical(e);
    const t = hitText(pt) ?? hitStroke(pt);
    if (t) {
      canvasRef.value?.setPointerCapture(e.pointerId);
      if (t.kind === "text") {
        const tx = t as SketchText;
        movingText = { el: tx, dx: pt.x - tx.x, dy: pt.y - tx.y, moved: false };
      } else {
        movingStroke = { el: t as SketchStroke, last: pt, moved: false };
      }
    }
    return;
  }
  if (activeTool.value === "text") {
    const pt = toLogical(e);
    const hit = hitText(pt);
    if (hit) {
      canvasRef.value?.setPointerCapture(e.pointerId);
      movingText = { el: hit, dx: pt.x - hit.x, dy: pt.y - hit.y, moved: false };
    } else {
      const rect = canvasRef.value!.getBoundingClientRect();
      composer.value = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        value: "",
      };
    }
    return;
  }
  canvasRef.value?.setPointerCapture(e.pointerId);
  drawing = true;
  currentStroke = {
    kind: "stroke",
    id: crypto.randomUUID(),
    tool: activeTool.value,
    color: activeColor.value,
    size: activeTool.value === "eraser" ? ERASER_SIZE : activeSize.value,
    points: [toLogical(e)],
  };
  strokes.value = [...strokes.value, currentStroke];
  requestRedraw();
};

const onPointerMove = (e: PointerEvent) => {
  if (movingText) {
    e.preventDefault();
    const pt = toLogical(e);
    movingText.el.x = pt.x - movingText.dx;
    movingText.el.y = pt.y - movingText.dy;
    movingText.moved = true;
    requestRedraw();
    return;
  }
  if (movingStroke) {
    e.preventDefault();
    const pt = toLogical(e);
    const dx = pt.x - movingStroke.last.x;
    const dy = pt.y - movingStroke.last.y;
    if (dx !== 0 || dy !== 0) {
      for (const p of movingStroke.el.points) {
        p.x += dx;
        p.y += dy;
      }
      movingStroke.last = pt;
      movingStroke.moved = true;
      requestRedraw();
    }
    return;
  }
  if (!drawing || !currentStroke) return;
  e.preventDefault();
  const events =
    typeof e.getCoalescedEvents === "function" ? e.getCoalescedEvents() : [e];
  for (const ev of events) {
    currentStroke.points.push(toLogical(ev as PointerEvent));
  }
  requestRedraw();
};

const endStroke = () => {
  if (movingText) {
    const wasMoved = movingText.moved;
    movingText = null;
    if (wasMoved) commit();
    if (pendingFit) migrateToFit(true);
    return;
  }
  if (movingStroke) {
    const wasMoved = movingStroke.moved;
    movingStroke = null;
    if (wasMoved) commit();
    if (pendingFit) migrateToFit(true);
    return;
  }
  if (!drawing) return;
  drawing = false;
  currentStroke = null;
  commit();
  if (pendingFit) migrateToFit(true);
};

const selectTool = (tool: CanvasTool) => {
  if (composer.value) commitComposer();
  activeTool.value = tool;
};

// --- Exportar / miniatura ---
const renderToCanvas = (targetW: number): HTMLCanvasElement => {
  const scale = targetW / paperW.value;
  const off = document.createElement("canvas");
  off.width = targetW;
  off.height = Math.round(paperH.value * scale);
  const ctx = off.getContext("2d")!;
  ctx.fillStyle = props.background;
  ctx.fillRect(0, 0, off.width, off.height);
  ctx.scale(scale, scale);
  for (const stroke of strokes.value) {
    drawOn(ctx, stroke);
  }
  return off;
};

export type ExportResult = "saved" | "cancelled";

const isTauri = () =>
  typeof window !== "undefined" &&
  (window as unknown as Record<string, unknown>).__TAURI_INTERNALS__ !== undefined;

const renderBlob = (): Promise<Blob> =>
  new Promise((resolve, reject) => {
    renderToCanvas(paperW.value).toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("No se pudo generar la imagen PNG."));
    }, "image/png");
  });

const exportPNG = async (fileName: string): Promise<ExportResult> => {
  const base = fileName.endsWith(".png") ? fileName : `${fileName}.png`;
  const blob = await renderBlob();

  // App de escritorio: diálogo nativo + escritura vía comando Rust.
  if (isTauri()) {
    const { save } = await import("@tauri-apps/plugin-dialog");
    const { invoke } = await import("@tauri-apps/api/core");
    const path = await save({
      defaultPath: base,
      filters: [{ name: "Imagen PNG", extensions: ["png"] }],
    });
    if (!path) return "cancelled";
    const data = Array.from(new Uint8Array(await blob.arrayBuffer()));
    await invoke("save_sketch_png", { path, data });
    return "saved";
  }

  // Navegador: File System Access API si existe.
  if ("showSaveFilePicker" in window) {
    try {
      const handle = await (window as unknown as {
        showSaveFilePicker: (opts: object) => Promise<{
          createWritable: () => Promise<{
            write: (data: Blob) => Promise<void>;
            close: () => Promise<void>;
          }>;
        }>;
      }).showSaveFilePicker({
        suggestedName: base,
        types: [
          { description: "Imagen PNG", accept: { "image/png": [".png"] } },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return "saved";
    } catch (e) {
      // Cancelado por el usuario en el diálogo del navegador.
      if (e instanceof DOMException && e.name === "AbortError") return "cancelled";
      throw e;
    }
  }

  // Último recurso: descarga clásica por anchor.
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = base;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return "saved";
};

const makeThumbnail = (maxW = 480): string => {
  if (strokes.value.length === 0) return "";
  return renderToCanvas(maxW).toDataURL("image/png");
};

const getPaperSize = () => ({ width: paperW.value, height: paperH.value });

defineExpose({
  undo,
  redo,
  clearCanvas,
  exportPNG,
  makeThumbnail,
  getPaperSize,
  canUndo,
  canRedo,
  strokeCount: computed(() => strokes.value.length),
});

watch(
  () => props.background,
  () => requestRedraw(),
);

onMounted(() => {
  // El editor monta el canvas ya con los trazos cargados (v-if loaded).
  // Primero se ajusta el papel al espacio visible y luego se siembra
  // el historial con el estado real (ya migrado).
  migrateToFit(false);
  history.value = [deepCopy(strokes.value)];
  historyIndex.value = 0;
  redraw();
  stageObserver = new ResizeObserver(() => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => migrateToFit(true), 250);
  });
  if (stageRef.value) stageObserver.observe(stageRef.value);
});

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId);
  if (resizeTimer) clearTimeout(resizeTimer);
  stageObserver?.disconnect();
  stageObserver = null;
});
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Barra de herramientas -->
    <div
      class="flex flex-wrap items-center gap-2 sm:gap-3 p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/15 select-none w-full"
    >
      <div class="flex items-center gap-1 p-1 rounded-xl bg-black/5 dark:bg-white/10">
        <button
          @click="selectTool('select')"
          title="Mover: arrastra trazos y textos con el mouse"
          class="cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all"
          :class="activeTool === 'select' ? 'bg-black text-white dark:bg-white dark:text-black shadow' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'"
        >
          <span class="material-symbols-outlined text-[20px]">near_me</span>
          <span class="hidden sm:inline">Mover</span>
        </button>
        <button
          @click="selectTool('pen')"
          title="Lápiz"
          class="cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all"
          :class="activeTool === 'pen' ? 'bg-black text-white dark:bg-white dark:text-black shadow' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'"
        >
          <span class="material-symbols-outlined text-[20px]">brush</span>
          <span class="hidden sm:inline">Lápiz</span>
        </button>
        <button
          @click="selectTool('eraser')"
          title="Borrador"
          class="cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all"
          :class="activeTool === 'eraser' ? 'bg-black text-white dark:bg-white dark:text-black shadow' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'"
        >
          <span class="material-symbols-outlined text-[20px]">ink_eraser</span>
          <span class="hidden sm:inline">Borrador</span>
        </button>
        <button
          @click="selectTool('text')"
          title="Texto: clic en el papel para escribir, arrastra un texto para moverlo"
          class="cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all"
          :class="activeTool === 'text' ? 'bg-black text-white dark:bg-white dark:text-black shadow' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'"
        >
          <span class="material-symbols-outlined text-[20px]">text_fields</span>
          <span class="hidden sm:inline">Texto</span>
        </button>
      </div>

      <div class="flex items-center gap-1.5 px-1">
        <button
          v-for="c in COLORS"
          :key="c"
          @click="activeColor = c; activeTool = 'pen'"
          :title="c"
          class="cursor-pointer w-7 h-7 rounded-full border-2 transition-all"
          :style="{ backgroundColor: c }"
          :class="activeColor === c && activeTool === 'pen' ? 'border-black dark:border-white scale-110' : 'border-black/10 dark:border-white/20 hover:scale-105'"
        />
      </div>

      <div class="flex items-center gap-1 p-1 rounded-xl bg-black/5 dark:bg-white/10">
        <button
          v-for="s in SIZES"
          :key="s"
          @click="activeSize = s; if (activeTool === 'eraser') activeTool = 'pen'"
          :title="`Grosor ${s}`"
          class="cursor-pointer w-9 h-9 rounded-lg flex items-center justify-center transition-all"
          :class="activeSize === s ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'"
        >
          <span class="rounded-full bg-current" :style="{ width: `${Math.min(s, 20)}px`, height: `${Math.min(s, 20)}px` }" />
        </button>
      </div>

      <div class="flex items-center gap-1 ml-auto">
        <button
          @click="undo"
          :disabled="!canUndo"
          title="Deshacer"
          class="cursor-pointer flex items-center justify-center w-9 h-9 rounded-xl text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span class="material-symbols-outlined text-[20px]">undo</span>
        </button>
        <button
          @click="redo"
          :disabled="!canRedo"
          title="Rehacer"
          class="cursor-pointer flex items-center justify-center w-9 h-9 rounded-xl text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span class="material-symbols-outlined text-[20px]">redo</span>
        </button>
        <button
          @click="clearCanvas"
          :disabled="strokes.length === 0"
          title="Limpiar todo"
          class="cursor-pointer flex items-center justify-center w-9 h-9 rounded-xl text-black/60 dark:text-white/60 hover:bg-red-500/10 hover:text-red-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span class="material-symbols-outlined text-[20px]">delete_sweep</span>
        </button>
      </div>
    </div>

    <!-- Lienzo: llena el escenario (ancho total + alto visible) -->
    <div
      ref="stage"
      class="relative flex-1 min-h-0 w-full rounded-2xl border border-black/10 dark:border-white/15 overflow-hidden shadow-sm"
    >
      <canvas
        ref="canvas"
        class="w-full h-full block touch-none select-none"
        :class="activeTool === 'select' ? 'cursor-default' : 'cursor-crosshair'"
        style="background: #ffffff"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="endStroke"
        @pointerleave="endStroke"
        @pointercancel="endStroke"
      />
      <input
        v-if="composer"
        ref="composerInput"
        v-model="composer.value"
        type="text"
        placeholder="Escribe aquí..."
        maxlength="120"
        class="absolute z-20 min-w-40 max-w-[80%] px-2 py-1 rounded-lg border-2 border-black dark:border-white bg-white/95 shadow-lg outline-none text-[16px] font-semibold text-black"
        :style="{ left: `${composer.x}px`, top: `${composer.y - 14}px` }"
        @keydown.enter="commitComposer"
        @keydown.escape="composer = null"
        @blur="commitComposer"
      />
    </div>
  </div>
</template>
