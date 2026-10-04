<script setup lang="ts">
import SketchCard from "./SketchCard.vue";
import NoContent from "../../../shared/components/NoContent.vue";
import { useSketchPreview } from "../composables/useSketchPreview";
import type { Sketch } from "../models/SketchModel";

withDefaults(
  defineProps<{
    sketches: Sketch[];
    isGrid?: boolean;
  }>(),
  { isGrid: true },
);

defineEmits<{
  (e: "delete", id: string): void;
}>();

const { showPreview } = useSketchPreview();
</script>

<template>
  <div v-if="sketches.length === 0" class="mt-6">
    <NoContent
      icon="brush"
      title="Sin trazos todavía"
      description="Crea tu primer dibujo con el botón Nuevo trazo."
    />
  </div>

  <div
    v-else-if="isGrid"
    class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5"
  >
    <SketchCard
      v-for="(sketch, i) in sketches"
      :key="sketch.id"
      :sketch="sketch"
      :index="i"
      @delete="$emit('delete', $event)"
    />
  </div>

  <div v-else class="flex flex-col gap-3">
    <button
      v-for="sketch in sketches"
      :key="sketch.id"
      @click="$router.push({ name: 'sketch-editor', params: { id: sketch.id } })"
      class="cursor-pointer flex items-center gap-4 p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/15 hover:border-black/20 dark:hover:border-white/25 hover:shadow-md transition-all text-left"
    >
      <div
        v-if="showPreview"
        class="w-24 shrink-0 rounded-xl overflow-hidden bg-[#f4f4f4] border border-black/5 dark:border-white/10"
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
          class="w-full h-full flex items-center justify-center text-black/20 dark:text-white/25"
        >
          <span class="material-symbols-outlined text-[24px]">brush</span>
        </div>
      </div>
      <div class="flex-1 min-w-0">
        <h3 class="text-[14px] font-bold text-black/80 dark:text-white/80 truncate">
          {{ sketch.title }}
        </h3>
        <p class="text-[12px] font-medium text-black/40 dark:text-white/50">
          {{ sketch.strokes.length }} {{ sketch.strokes.length === 1 ? "trazo" : "trazos" }}
          ·
          {{ new Date(sketch.updatedAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" }) }}
        </p>
      </div>
      <span class="material-symbols-outlined text-[20px] text-black/30 dark:text-white/40 shrink-0">
        chevron_right
      </span>
    </button>
  </div>
</template>
