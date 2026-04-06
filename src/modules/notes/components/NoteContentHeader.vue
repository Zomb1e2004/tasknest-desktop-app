<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import type { Note } from "../models/NoteModel";
import { noteService } from "../services/NoteService";
import { useToast } from "../../../shared/composables/useToast";
import ConvertFormatModal from "./ConvertFormatModal.vue";

const props = defineProps<{
  note?: Note;
}>();

const router = useRouter();
const { addToast } = useToast();
const showModal = ref(false);

const targetFormat = computed(() =>
  props.note?.format === "md" ? "txt" : "md",
);

const handleConvert = async () => {
  if (!props.note?.id) return;

  try {
    await noteService.update(props.note.id, {
      format: targetFormat.value,
    });

    addToast({
      title: "Formato convertido",
      message: `La nota se ha convertido a ${targetFormat.value.toUpperCase()} correctamente.`,
      type: "success",
    });

    router.back();
  } catch (error) {
    addToast({
      title: "Error",
      message: "No se pudo convertir el formato de la nota.",
      type: "error",
    });
  } finally {
    showModal.value = false;
  }
};
</script>

<template>
  <div class="flex items-center justify-between gap-4 w-full">
    <div class="flex flex-wrap gap-2">
      <template v-if="note?.tags && note.tags.length > 0">
        <div
          v-for="tag in note.tags"
          :key="tag"
          class="px-2.5 py-1 rounded-lg bg-black/5 border border-black/5 text-[11px] font-bold text-black/50 uppercase tracking-tight"
        >
          #{{ tag }}
        </div>
      </template>
      <div
        v-else
        class="px-2.5 py-1 rounded-lg bg-black/5 border border-black/5 text-[11px] font-bold text-black/30 uppercase tracking-tight italic"
      >
        Sin etiquetas
      </div>
    </div>

    <button
      @click="showModal = true"
      class="flex cursor-pointer items-center gap-2 px-3 py-1.5 rounded-xl border border-black/10 bg-white hover:bg-black/2 transition-all active:scale-95 group shadow-sm hover:shadow-md"
      :title="`Convertir a ${targetFormat.toUpperCase()}`"
    >
      <span
        class="material-symbols-outlined text-[18px] text-black/40 group-hover:text-black transition-colors"
      >
        {{ targetFormat === "md" ? "markdown" : "description" }}
      </span>
      <span
        class="text-[12px] font-bold text-black/60 group-hover:text-black hidden sm:inline transition-colors"
      >
        Convertir a {{ targetFormat.toUpperCase() }}
      </span>
    </button>
  </div>

  <ConvertFormatModal
    :show="showModal"
    :target-format="targetFormat"
    @close="showModal = false"
    @confirm="handleConvert"
  />
</template>
