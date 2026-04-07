<script setup lang="ts">
import { computed } from "vue";
import { useTasksSort } from "../composables/useTasksSort";
import { useTasksView } from "../composables/useTasksView";
import { useTasksFilter } from "../composables/useTasksFilter";
import { noteService } from "../../notes/services/NoteService";
import ListTool from "../../../shared/components/ListTool.vue";

const emit = defineEmits<{
  (e: "tagDeleted", tagName: string): void;
}>();

const { sortOption, sortOrder } = useTasksSort();
const { isGridView, toggleView } = useTasksView();
const { selectedStatus, selectedTag } = useTasksFilter();

const options = [
  { value: "title", label: "Título" },
  { value: "priority", label: "Prioridad" },
  { value: "createdAt", label: "Creación" },
];

const filterLabel = computed(() => {
  let label = "";
  if (!selectedStatus.value && !selectedTag.value) return "Todas";
  
  if (selectedStatus.value) {
    if (selectedStatus.value === "completed") label = "Completadas";
    else if (selectedStatus.value === "pending") label = "Pendientes";
  }

  if (selectedTag.value) {
    label = label ? `${label} + #${selectedTag.value}` : `#${selectedTag.value}`;
  }

  return label || "Todas";
});

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
};

const selectStatus = (status: string | null) => {
  selectedStatus.value = status;
};

const handleTagDeleted = async (tagName: string) => {
  await noteService.removeTagFromAllNotes(tagName);
  emit("tagDeleted", tagName);
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
    :show-view-toggle="true"
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
          Estado de tarea
        </span>
      </div>

      <button
        @click="selectStatus(null)"
        class="w-full cursor-pointer text-left px-3 py-2 text-[13px] font-semibold transition-colors flex items-center gap-2.5 mx-0"
        :class="
          !selectedStatus
            ? 'bg-black/5 text-black'
            : 'text-black/55 hover:bg-black/4 hover:text-black/80'
        "
      >
        <span class="material-symbols-outlined text-[15px] text-black/40"
          >task</span
        >
        Todas las tareas
        <span
          v-if="!selectedStatus"
          class="material-symbols-outlined text-[14px] ml-auto"
          >check</span
        >
      </button>

      <button
        @click="selectStatus('pending')"
        class="w-full cursor-pointer text-left px-3 py-2 text-[13px] font-semibold transition-colors flex items-center gap-2.5 mx-0"
        :class="
          selectedStatus === 'pending'
            ? 'bg-black/5 text-black'
            : 'text-black/55 hover:bg-black/4 hover:text-black/80'
        "
      >
        <span class="material-symbols-outlined text-[15px] text-black/40"
          >pending_actions</span
        >
        Pendientes
        <span
          v-if="selectedStatus === 'pending'"
          class="material-symbols-outlined text-[14px] ml-auto"
          >check</span
        >
      </button>

      <button
        @click="selectStatus('completed')"
        class="w-full cursor-pointer text-left px-3 py-2 text-[13px] font-semibold transition-colors flex items-center gap-2.5 mx-0"
        :class="
          selectedStatus === 'completed'
            ? 'bg-black/5 text-black'
            : 'text-black/55 hover:bg-black/4 hover:text-black/80'
        "
      >
        <span class="material-symbols-outlined text-[15px] text-black/40"
          >task_alt</span
        >
        Completadas
        <span
          v-if="selectedStatus === 'completed'"
          class="material-symbols-outlined text-[14px] ml-auto"
          >check</span
        >
      </button>
    </template>
  </ListTool>
</template>
