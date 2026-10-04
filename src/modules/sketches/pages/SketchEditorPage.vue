<script setup lang="ts">
import { ref, computed, onMounted, useTemplateRef } from "vue";
import { useRouter, useRoute } from "vue-router";
import Page from "../../../shared/components/Page.vue";
import Button from "../../../shared/components/Button.vue";
import SketchCanvas from "../components/SketchCanvas.vue";
import SketchDeleteModal from "../components/SketchDeleteModal.vue";
import { sketchService } from "../services/SketchService";
import { useToast } from "../../../shared/composables/useToast";
import { useDevMode } from "../../../shared/composables/useDevMode";
import type { Sketch, SketchElement } from "../models/SketchModel";
import { normalizeElements } from "../models/SketchModel";

const router = useRouter();
const route = useRoute();
const { addToast } = useToast();
const { isDevMode } = useDevMode();

const canvasRef = useTemplateRef<InstanceType<typeof SketchCanvas>>("canvasRef");

const sketch = ref<Sketch | null>(null);
const title = ref("");
const strokes = ref<SketchElement[]>([]);
const loaded = ref(false);
const saving = ref(false);
const showDeleteModal = ref(false);
const lastSavedSnapshot = ref("");
// Solo se muestra cuando modeDev === "1" en localStorage.
const debugError = ref("");

const isDirty = computed(() => {
  if (!loaded.value) return false;
  const current = JSON.stringify({ title: title.value.trim(), strokes: strokes.value });
  return current !== lastSavedSnapshot.value;
});

const snapshotNow = () => {
  lastSavedSnapshot.value = JSON.stringify({
    title: title.value.trim(),
    strokes: strokes.value,
  });
};

const sanitizeFileName = (name: string) =>
  (name.trim() || "trazo").replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, "_");

const loadSketch = async () => {
  const id = route.params.id as string;
  const found = await sketchService.getById(id);
  if (!found) {
    addToast({
      title: "No encontrado",
      message: "Ese trazo no existe.",
      type: "error",
    });
    router.replace("/sketches");
    return;
  }
  sketch.value = found;
  title.value = found.title;
  strokes.value = normalizeElements(found.strokes ?? []);
  loaded.value = true;
  snapshotNow();
};

const handleSave = async () => {
  if (!sketch.value || saving.value) return;
  saving.value = true;
  try {
    const thumbnail = canvasRef.value?.makeThumbnail() ?? sketch.value.thumbnail;
    const cleanTitle = title.value.trim() || "Sin título";
    title.value = cleanTitle;
    const paperSize = canvasRef.value?.getPaperSize() ?? { width: 1600, height: 1000 };
    // IndexedDB no acepta proxies reactivos de Vue (DataCloneError):
    // se guarda una copia plana serializable.
    const plainStrokes = JSON.parse(
      JSON.stringify(strokes.value),
    ) as SketchElement[];
    await sketchService.update(sketch.value.id, {
      title: cleanTitle,
      strokes: plainStrokes,
      width: paperSize.width,
      height: paperSize.height,
      thumbnail,
    });
    snapshotNow();
    addToast({
      title: "Trazo guardado",
      message: "Tu dibujo se ha guardado correctamente.",
      type: "success",
    });
  } catch (error) {
    console.error("[Trazos] Fallo al guardar:", error);
    if (isDevMode.value) {
      const detail =
        error instanceof Error
          ? `${error.name}: ${error.message}${error.stack ? `\n${error.stack}` : ""}`
          : String(error);
      debugError.value = detail;
      addToast({
        title: "Error",
        message: `No se pudo guardar el trazo. Detalle: ${detail.slice(0, 160)}`,
        type: "error",
      });
    } else {
      addToast({
        title: "Error",
        message: "No se pudo guardar el trazo.",
        type: "error",
      });
    }
  } finally {
    saving.value = false;
  }
};

const handleExport = async () => {
  if (!canvasRef.value) return;
  if (strokes.value.length === 0) {
    addToast({
      title: "Lienzo vacío",
      message: "Dibuja algo antes de exportar.",
      type: "warning",
    });
    return;
  }
  try {
    const result = await canvasRef.value.exportPNG(sanitizeFileName(title.value));
    if (result === "saved") {
      addToast({
        title: "PNG guardado",
        message: "Tu dibujo se ha guardado como imagen.",
        type: "success",
      });
    }
  } catch (error) {
    console.error("[Trazos] Fallo al exportar:", error);
    if (isDevMode.value) {
      const detail =
        error instanceof Error ? `${error.name}: ${error.message}` : String(error);
      debugError.value = detail;
    }
    addToast({
      title: "Error",
      message: "No se pudo exportar el PNG.",
      type: "error",
    });
  }
};

const handleConfirmDelete = async () => {
  if (!sketch.value) return;
  try {
    await sketchService.delete(sketch.value.id);
    showDeleteModal.value = false;
    addToast({
      title: "Trazo eliminado",
      message: "El dibujo se ha borrado correctamente.",
      type: "success",
    });
    router.replace("/sketches");
  } catch (error) {
    addToast({
      title: "Error",
      message: "No se pudo eliminar el trazo.",
      type: "error",
    });
  }
};

const goBack = () => {
  router.push("/sketches");
};

onMounted(loadSketch);
</script>

<template>
  <Page>
    <div class="flex flex-col gap-5 w-full h-[calc(100dvh-15rem)] sm:h-[calc(100dvh-16.5rem)] min-h-[480px]">
      <!-- Barra superior -->
      <div class="flex items-center gap-3 select-none">
        <button
          @click="goBack"
          title="Volver a trazos"
          class="cursor-pointer flex items-center justify-center w-10 h-10 rounded-xl text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 border border-transparent hover:border-black/10 dark:hover:border-white/10 transition-all"
        >
          <span class="material-symbols-outlined text-[22px]">arrow_back</span>
        </button>

        <div class="flex items-center gap-2 px-1">
          <span class="material-symbols-outlined text-[16px] text-black/30 dark:text-white/40">brush</span>
          <p class="text-[10px] font-bold uppercase tracking-[0.25em] text-black/30 dark:text-white/40">
            Editor de trazo
          </p>
        </div>

        <span
          v-if="isDirty"
          class="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full"
        >
          Sin guardar
        </span>

        <div class="flex items-center gap-2 ml-auto">
          <Button variant="ghost" icon="download" :animate-icon="false" @click="handleExport">
            <span class="hidden sm:inline">PNG</span>
          </Button>
          <Button variant="secondary" icon="delete" :animate-icon="false" @click="showDeleteModal = true">
            <span class="hidden sm:inline">Borrar</span>
          </Button>
          <Button :disabled="saving || !isDirty" icon="save" :animate-icon="false" @click="handleSave">
            Guardar
          </Button>
        </div>
      </div>

      <!-- Título -->
      <input
        v-model="title"
        type="text"
        placeholder="Título del dibujo..."
        maxlength="60"
        class="w-full bg-transparent outline-none text-3xl sm:text-4xl font-bold tracking-tight text-black/90 dark:text-white/90 placeholder:text-black/20 dark:placeholder-white/25"
      />

      <!-- Banner de diagnóstico: solo visible con modeDev === "1" -->
      <div
        v-if="debugError"
        class="rounded-2xl border-2 border-red-500/60 bg-red-500/10 p-4 flex flex-col gap-2 select-text"
      >
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[20px] text-red-500">bug_report</span>
          <p class="text-sm font-black uppercase tracking-widest text-red-500">
            Detalle del error (temporal)
          </p>
          <button
            @click="debugError = ''"
            class="cursor-pointer ml-auto flex items-center justify-center w-8 h-8 rounded-lg text-red-500 hover:bg-red-500/10 transition-all"
            title="Cerrar"
          >
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        <pre class="text-[12px] font-mono whitespace-pre-wrap break-all text-black/80 dark:text-white/80 max-h-48 overflow-y-auto">{{ debugError }}</pre>
      </div>

      <!-- Lienzo -->
      <SketchCanvas
        v-if="loaded"
        ref="canvasRef"
        v-model:strokes="strokes"
        :width="1600"
        :height="1000"
        background="#ffffff"
        class="flex-1 min-h-0"
      />
      <div
        v-else
        class="rounded-2xl border border-black/10 dark:border-white/15 bg-black/2 dark:bg-white/5 animate-pulse"
        style="aspect-ratio: 16 / 10"
      />
    </div>

    <Teleport to="body">
      <SketchDeleteModal
        v-if="showDeleteModal"
        :title="title || 'Sin título'"
        @confirm="handleConfirmDelete"
        @close="showDeleteModal = false"
      />
    </Teleport>
  </Page>
</template>
