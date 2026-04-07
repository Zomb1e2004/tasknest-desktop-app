<script setup lang="ts">
import { computed } from "vue";
import { useNotesSort } from "../composables/useNotesSort";
import { useNotesView } from "../composables/useNotesView";
import { useNotesFilter } from "../composables/useNotesFilter";
import { noteService } from "../services/NoteService";
import ListTool from "../../../shared/components/ListTool.vue";

const emit = defineEmits<{
  (e: "tagDeleted"): void;
}>();

const { sortOption, sortOrder } = useNotesSort();
const { isGridView, toggleView } = useNotesView();
const { selectedTag, selectedFormat } = useNotesFilter();

const options = [
  { value: "title", label: "Título" },
  { value: "totalVisits", label: "Visitas" },
  { value: "lastSeen", label: "Visto recientemente" },
  { value: "createdAt", label: "Fecha de creación" },
  { value: "updatedAt", label: "Fecha de modificación" },
];

const filterLabel = computed(() => {
  if (!selectedTag.value && !selectedFormat.value) return "Todas";
  if (selectedTag.value && selectedFormat.value)
    return `${selectedFormat.value.toUpperCase()} + #${selectedTag.value}`;
  if (selectedTag.value) return `#${selectedTag.value}`;
  return selectedFormat.value!.toUpperCase();
});

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
};

const selectFormat = (format: string | null) => {
  selectedFormat.value = format;
};

const handleTagDeleted = async (tagName: string) => {
  await noteService.removeTagFromAllNotes(tagName);
  emit("tagDeleted");
};
</script>

<template>
  <ListTool
    v-model:sort-option="sortOption"
    v-model:selected-tag="selectedTag"
    :is-grid-view="isGridView"
    :sort-order="sortOrder"
    :sort-options="options"
    :filter-label="filterLabel"
    show-view-toggle
    show-sort
    show-filter
    show-tag-actions
    @toggle-view="toggleView"
    @toggle-sort-order="toggleSortOrder"
    @tag-deleted="handleTagDeleted"
  >
    <template #filters>
      <div class="px-3 pt-1 pb-2">
        <span
          class="text-[10px] font-bold text-black/30 uppercase tracking-widest"
        >
          General
        </span>
      </div>

      <button
        @click="
          selectedTag = null;
          selectedFormat = null;
        "
        class="w-full cursor-pointer text-left px-3 py-2 text-[13px] font-semibold transition-colors flex items-center gap-2.5 mx-0"
        :class="
          !selectedTag && !selectedFormat
            ? 'bg-black/5 text-black'
            : 'text-black/55 hover:bg-black/4 hover:text-black/80'
        "
      >
        <span class="material-symbols-outlined text-[15px] text-black/40"
          >done_all</span
        >
        Todas las notas
        <span
          v-if="!selectedTag && !selectedFormat"
          class="material-symbols-outlined text-[14px] ml-auto"
          >check</span
        >
      </button>

      <div class="h-px bg-black/5 my-1 mx-3"></div>

      <div class="px-3 pt-1 pb-2">
        <span
          class="text-[10px] font-bold text-black/30 uppercase tracking-widest"
        >
          Filtrar por formato
        </span>
      </div>

      <div
        class="flex gap-1 mx-2.5 mb-1 bg-black/3 p-1 rounded-xl border border-black/5"
      >
        <button
          @click="selectFormat('md')"
          class="flex-1 cursor-pointer py-2 rounded-lg text-[12px] font-bold transition-all"
          :class="
            selectedFormat === 'md'
              ? 'bg-white shadow-sm text-black border border-black/5'
              : 'text-black/40 hover:text-black/60'
          "
        >
          MD
        </button>
        <button
          @click="selectFormat('txt')"
          class="flex-1 cursor-pointer py-2 rounded-lg text-[12px] font-bold transition-all"
          :class="
            selectedFormat === 'txt'
              ? 'bg-white shadow-sm text-black border border-black/5'
              : 'text-black/40 hover:text-black/60'
          "
        >
          TXT
        </button>
      </div>
    </template>
  </ListTool>
</template>
