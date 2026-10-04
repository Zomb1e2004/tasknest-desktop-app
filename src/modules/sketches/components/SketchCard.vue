<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { motion } from "motion-v";
import type { Sketch } from "../models/SketchModel";
import { sketchService } from "../services/SketchService";
import { useToast } from "../../../shared/composables/useToast";
import { useSketchPreview } from "../composables/useSketchPreview";
import SketchDeleteModal from "./SketchDeleteModal.vue";

const props = withDefaults(
  defineProps<{
    sketch: Sketch;
    index?: number;
  }>(),
  { index: 0 },
);

const emit = defineEmits<{
  (e: "delete", id: string): void;
}>();

const router = useRouter();
const { addToast } = useToast();
const { showPreview } = useSketchPreview();
const showDeleteModal = ref(false);

const getRelativeTime = (date: number) => {
  const diffHrs = Math.floor((Date.now() - date) / (1000 * 60 * 60));
  if (diffHrs < 1) return "Actualizado hace poco";
  if (diffHrs < 24) return `Actualizado hace ${diffHrs}h`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `Actualizado hace ${diffDays}d`;
  return `Actualizado el ${new Date(date).toLocaleDateString("es-ES", {
    month: "short",
    day: "numeric",
  })}`;
};

const openEditor = () => {
  router.push({ name: "sketch-editor", params: { id: props.sketch.id } });
};

const handleConfirmDelete = async () => {
  try {
    await sketchService.delete(props.sketch.id);
    showDeleteModal.value = false;
    emit("delete", props.sketch.id);
    addToast({
      title: "Trazo eliminado",
      message: "El dibujo se ha borrado correctamente.",
      type: "success",
    });
  } catch (error) {
    addToast({
      title: "Error",
      message: "No se pudo eliminar el trazo.",
      type: "error",
    });
  }
};
</script>

<template>
  <motion.article
    layout
    :initial="{ opacity: 0, y: 0 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.25, ease: 'easeOut' }"
    class="group relative bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/15 rounded-3xl flex flex-col shadow-sm hover:shadow-lg hover:border-black/20 dark:hover:border-white/25 transition-all duration-300 cursor-pointer overflow-hidden"
    @click="openEditor"
  >
    <div
      v-if="showPreview"
      class="relative w-full bg-[#f4f4f4] border-b border-black/5 dark:border-white/10 overflow-hidden"
      style="aspect-ratio: 16 / 10"
    >
      <img
        v-if="sketch.thumbnail"
        :src="sketch.thumbnail"
        :alt="sketch.title"
        class="w-full h-full object-cover"
      />
      <div
        v-else
        class="w-full h-full flex flex-col items-center justify-center gap-2 text-black/20 dark:text-white/25"
      >
        <span class="material-symbols-outlined text-[40px]">brush</span>
        <span class="text-[11px] font-bold uppercase tracking-widest">Lienzo vacío</span>
      </div>
    </div>

    <div class="flex flex-col gap-2 p-4">
      <div class="flex items-start justify-between gap-3">
        <h3
          class="text-[15px] font-bold text-black/80 dark:text-white/80 leading-snug group-hover:text-black dark:group-hover:text-white transition-colors truncate"
        >
          {{ sketch.title }}
        </h3>
        <button
          @click.stop="showDeleteModal = true"
          title="Eliminar trazo"
          class="cursor-pointer flex shrink-0 items-center justify-center w-8 h-8 rounded-lg text-black/30 dark:text-white/40 hover:text-red-500 hover:bg-red-500/10 transition-all"
        >
          <span class="material-symbols-outlined text-[20px]">delete</span>
        </button>
      </div>

      <div class="flex items-center justify-between gap-2">
        <span class="text-[11px] font-bold text-black/40 dark:text-white/50">
          {{ sketch.strokes.length }} {{ sketch.strokes.length === 1 ? "trazo" : "trazos" }}
        </span>
        <span class="text-[11px] font-medium text-black/40 dark:text-white/50">
          {{ getRelativeTime(sketch.updatedAt) }}
        </span>
      </div>
    </div>

    <Teleport to="body">
      <SketchDeleteModal
        v-if="showDeleteModal"
        :title="sketch.title"
        @confirm="handleConfirmDelete"
        @close="showDeleteModal = false"
      />
    </Teleport>
  </motion.article>
</template>
