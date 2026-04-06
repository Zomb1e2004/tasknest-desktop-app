<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useNotesSort } from "../composables/useNotesSort";
import { useNotesView } from "../composables/useNotesView";
import { useNotesFilter } from "../composables/useNotesFilter";
import { tagService } from "../services/TagService";
import { noteService } from "../services/NoteService";
import { useToast } from "../../../shared/composables/useToast";
import { Tag } from "../models/TagModel";
import TagCreateModal from "./TagCreateModal.vue";
import TagDeleteModal from "./TagDeleteModal.vue";

const { sortOption, sortOrder } = useNotesSort();
const { isGridView, toggleView } = useNotesView();
const { selectedTag, selectedFormat } = useNotesFilter();
const { addToast } = useToast();

const emit = defineEmits<{
  (e: "tagDeleted"): void;
}>();

const isDropdownOpen = ref(false);
const isFilterOpen = ref(false);
const allTags = ref<Tag[]>([]);
const showTagModal = ref(false);
const newTagName = ref("");
const isSavingTag = ref(false);

const showDeleteTagModal = ref(false);
const tagToDelete = ref<Tag | null>(null);
const isDeletingTag = ref(false);

const options = [
  { value: "title", label: "Título" },
  { value: "totalVisits", label: "Visitas" },
  { value: "createdAt", label: "Fecha de creación" },
  { value: "updatedAt", label: "Fecha de modificación" },
];

const selectedLabel = computed(() => {
  return options.find((o) => o.value === sortOption.value)?.label || "";
});

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

const selectOption = (val: string) => {
  sortOption.value = val;
  isDropdownOpen.value = false;
};

const selectFormat = (format: string | null) => {
  selectedFormat.value = format;
  isFilterOpen.value = false;
};

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const handleCreateTag = async () => {
  const name = newTagName.value.trim().toLowerCase();
  if (!name) return;

  isSavingTag.value = true;
  try {
    const existing = await tagService.getByName(name);
    if (existing) {
      addToast({
        title: "Etiqueta existente",
        message: "Ya existe una etiqueta con ese nombre.",
        type: "error",
      });
      return;
    }

    await tagService.create({
      name: name,
    });

    addToast({
      title: "Etiqueta creada",
      message: "La etiqueta se ha creado correctamente.",
      type: "success",
    });

    newTagName.value = "";
    await loadAllTags();
  } catch (error) {
    addToast({
      title: "Error",
      message: "No se pudo crear la etiqueta.",
      type: "error",
    });
  } finally {
    isSavingTag.value = false;
  }
};

const closeDropdown = (e: Event) => {
  const target = e.target as HTMLElement;
  if (!target.closest(".custom-dropdown-container")) {
    isDropdownOpen.value = false;
  }
  if (!target.closest(".filter-dropdown-container")) {
    isFilterOpen.value = false;
  }
};

const loadAllTags = async () => {
  allTags.value = await tagService.getAll();
};

// Abre el modal de confirmación sin ejecutar nada todavía
const handleDeleteTag = (tag: Tag) => {
  tagToDelete.value = tag;
  showDeleteTagModal.value = true;
  isFilterOpen.value = false;
};

// Se ejecuta al confirmar en el modal
const confirmDeleteTag = async () => {
  if (!tagToDelete.value) return;

  isDeletingTag.value = true;
  try {
    await noteService.removeTagFromAllNotes(tagToDelete.value.name);
    await tagService.delete(tagToDelete.value.id);

    if (selectedTag.value === tagToDelete.value.name) {
      selectedTag.value = null;
    }

    addToast({
      title: "Etiqueta eliminada",
      message: `La etiqueta "#${tagToDelete.value.name}" fue eliminada de todas las notas.`,
      type: "success",
    });

    showDeleteTagModal.value = false;
    tagToDelete.value = null;
    await loadAllTags();
    emit("tagDeleted");
  } catch (error) {
    addToast({
      title: "Error",
      message: "No se pudo eliminar la etiqueta.",
      type: "error",
    });
  } finally {
    isDeletingTag.value = false;
  }
};

const selectTag = (tagName: string | null) => {
  selectedTag.value = tagName;
  isFilterOpen.value = false;
};

onMounted(async () => {
  await loadAllTags();
  document.addEventListener("click", closeDropdown);
});

defineExpose({
  loadAllTags,
});

onUnmounted(() => {
  document.removeEventListener("click", closeDropdown);
});
</script>

<template>
  <div class="flex items-center justify-center sm:justify-end w-full gap-2">
    <!-- View Toggle Button -->
    <button
      @click="toggleView"
      class="text-black/40 hover:text-black/80 transition-all duration-200 cursor-pointer flex items-center justify-center rounded-xl border border-black/8 bg-white hover:border-black/15 hover:shadow-sm h-[38px] w-[38px]"
      :title="
        isGridView
          ? 'Cambiar a vista de lista'
          : 'Cambiar a vista de cuadrícula'
      "
    >
      <span class="material-symbols-outlined text-[20px]">{{
        isGridView ? "view_list" : "grid_view"
      }}</span>
    </button>

    <!-- Create Tag Button -->
    <button
      @click="showTagModal = true"
      class="text-black/40 hover:text-black/80 transition-all duration-200 cursor-pointer flex items-center justify-center rounded-xl border border-black/8 bg-white hover:border-black/15 hover:shadow-sm h-[38px] w-[38px]"
      title="Crear nueva etiqueta"
    >
      <span class="material-symbols-outlined text-[20px]">new_label</span>
    </button>

    <!-- Tag Filter Dropdown -->
    <div
      class="filter-dropdown-container relative flex items-center bg-white border border-black/8 rounded-xl hover:border-black/15 hover:shadow-sm transition-all duration-200 font-['Manrope'] h-[38px]"
    >
      <div
        @click="isFilterOpen = !isFilterOpen"
        class="relative flex items-center py-2 px-3 cursor-pointer group gap-1.5"
      >
        <span
          class="material-symbols-outlined text-[17px] text-black/40 group-hover:text-black/70 transition-colors"
          :class="{ 'text-black! opacity-100': selectedTag || selectedFormat }"
        >
          filter_list
        </span>
        <span
          class="text-[13px] font-semibold text-black/60 group-hover:text-black/80 transition-colors select-none"
          :class="{ 'text-black!': selectedTag || selectedFormat }"
        >
          {{ filterLabel }}
        </span>
        <span
          class="material-symbols-outlined text-[16px] text-black/30 transition-transform duration-300"
          :class="isFilterOpen ? 'rotate-180' : ''"
        >
          expand_more
        </span>
      </div>

      <transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 -translate-y-1 scale-95"
      >
        <div
          v-if="isFilterOpen"
          class="absolute top-full right-0 mt-2 min-w-[190px] bg-white border border-black/8 rounded-2xl shadow-lg shadow-black/5 z-20 overflow-hidden origin-top-right py-1.5"
        >
          <!-- Header dentro del dropdown -->
          <div class="px-3 pt-1 pb-2">
            <span
              class="text-[10px] font-bold text-black/30 uppercase tracking-widest"
            >
              Filtrar por etiqueta
            </span>
          </div>

          <button
            @click="
              selectedTag = null;
              selectedFormat = null;
              isFilterOpen = false;
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

          <!-- Filtro por Formato -->
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

          <div class="h-px bg-black/5 my-1 mx-3"></div>

          <div class="px-3 pt-2 pb-1.5 text-center">
            <span
              class="text-[10px] font-bold text-black/30 uppercase tracking-widest"
            >
              Etiqueta
            </span>
          </div>

          <div
            v-for="tag in allTags"
            :key="tag.id"
            class="group/item flex items-center mx-1.5 rounded-lg transition-colors"
            :class="
              selectedTag === tag.name ? 'bg-black/5' : 'hover:bg-black/4'
            "
          >
            <button
              @click="selectTag(tag.name)"
              class="flex-1 cursor-pointer text-left px-2.5 py-2 text-[13px] font-semibold transition-colors flex items-center gap-2"
              :class="
                selectedTag === tag.name
                  ? 'text-black'
                  : 'text-black/55 hover:text-black/80'
              "
            >
              <span class="text-black/30 font-bold text-[11px]">#</span
              >{{ tag.name }}
              <span
                v-if="selectedTag === tag.name"
                class="material-symbols-outlined text-[14px] ml-auto"
                >check</span
              >
            </button>
            <button
              @click.stop="handleDeleteTag(tag)"
              class="w-6 h-6 mr-2 flex items-center justify-center opacity-0 group-hover/item:opacity-100 text-black/25 hover:text-red-400 rounded-md transition-all duration-150 cursor-pointer shrink-0"
              title="Eliminar etiqueta"
            >
              <span class="material-symbols-outlined text-[14px]">delete</span>
            </button>
          </div>

          <div
            v-if="allTags.length === 0"
            class="px-4 py-3 text-[12px] font-medium text-black/30 text-center"
          >
            Sin etiquetas creadas
          </div>
        </div>
      </transition>
    </div>

    <!-- Sorting Dropdown -->
    <div
      class="custom-dropdown-container relative flex items-center bg-white border border-black/8 rounded-xl hover:border-black/15 hover:shadow-sm transition-all duration-200 font-['Manrope'] h-[38px]"
    >
      <div
        @click="toggleDropdown"
        class="relative flex items-center py-2 pl-3 pr-2 cursor-pointer group gap-1.5"
      >
        <span
          class="material-symbols-outlined text-[17px] text-black/40 group-hover:text-black/70 transition-colors"
        >
          sort
        </span>
        <span
          class="text-[13px] font-semibold text-black/60 group-hover:text-black/80 transition-colors select-none"
        >
          {{ selectedLabel }}
        </span>
        <span
          class="material-symbols-outlined text-[16px] text-black/30 transition-transform duration-300"
          :class="isDropdownOpen ? 'rotate-180' : ''"
        >
          expand_more
        </span>
      </div>

      <div class="w-px h-4 bg-black/8 mx-1"></div>

      <button
        @click="toggleSortOrder"
        class="py-2 px-2.5 text-black/40 hover:text-black/70 hover:bg-black/5 transition-colors rounded-r-xl flex items-center justify-center cursor-pointer"
        :title="sortOrder === 'desc' ? 'Orden descendente' : 'Orden ascendente'"
      >
        <span
          class="material-symbols-outlined text-[17px] transition-transform duration-500 transform"
          :class="sortOrder === 'desc' ? '' : '-rotate-180'"
        >
          arrow_downward
        </span>
      </button>

      <transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 -translate-y-1 scale-95"
      >
        <div
          v-if="isDropdownOpen"
          class="absolute top-full left-0 mt-2 min-w-full bg-white border border-black/8 rounded-2xl shadow-lg shadow-black/5 z-20 overflow-hidden origin-top-left py-1.5"
        >
          <div class="px-3 pt-1 pb-2">
            <span
              class="text-[10px] font-bold text-black/30 uppercase tracking-widest"
            >
              Ordenar por
            </span>
          </div>
          <button
            v-for="option in options"
            :key="option.value"
            @click="selectOption(option.value)"
            class="w-full cursor-pointer text-left px-3 py-2 text-[13px] font-semibold transition-colors flex items-center justify-between"
            :class="
              sortOption === option.value
                ? 'bg-black/5 text-black'
                : 'text-black/55 hover:bg-black/4 hover:text-black/80'
            "
          >
            {{ option.label }}
            <span
              v-if="sortOption === option.value"
              class="material-symbols-outlined text-[14px]"
              >check</span
            >
          </button>
        </div>
      </transition>
    </div>

    <Teleport to="body">
      <TagCreateModal
        v-if="showTagModal"
        v-model="newTagName"
        :is-saving="isSavingTag"
        @confirm="handleCreateTag"
        @close="showTagModal = false"
      />

      <TagDeleteModal
        v-if="showDeleteTagModal && tagToDelete"
        :tag="tagToDelete"
        :is-deleting="isDeletingTag"
        @confirm="confirmDeleteTag"
        @close="
          showDeleteTagModal = false;
          tagToDelete = null;
        "
      />
    </Teleport>
  </div>
</template>
