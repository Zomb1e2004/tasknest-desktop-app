<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { tagService } from "../services/TagService";
import { useToast } from "../composables/useToast";
import type { Tag } from "../models/TagModel";
import TagCreateModal from "./TagCreateModal.vue";
import TagDeleteModal from "./TagDeleteModal.vue";

interface SortOption {
  value: string;
  label: string;
}

const props = defineProps<{
  isGridView?: boolean;
  sortOption?: string;
  sortOrder?: "asc" | "desc";
  sortOptions?: SortOption[];
  filterLabel?: string;
  showViewToggle?: boolean;
  showSort?: boolean;
  showFilter?: boolean;
  showTagActions?: boolean;
  selectedTag?: string | null;
}>();

const emit = defineEmits<{
  (e: "toggleView"): void;
  (e: "toggleSortOrder"): void;
  (e: "update:sortOption", val: string): void;
  (e: "tagCreated"): void;
  (e: "tagDeleted", tagName: string): void;
  (e: "update:selectedTag", tag: string | null): void;
}>();

const { addToast } = useToast();

const isSortOpen = ref(false);
const isFilterOpen = ref(false);

const allTags = ref<Tag[]>([]);
const showTagModal = ref(false);
const newTagName = ref("");
const isSavingTag = ref(false);

const showDeleteTagModal = ref(false);
const tagToDelete = ref<Tag | null>(null);
const isDeletingTag = ref(false);

const selectedSortLabel = computed(() => {
  if (!props.sortOptions) return "";
  return props.sortOptions.find((o) => o.value === props.sortOption)?.label || "";
});

const closeDropdowns = (e: Event) => {
  const target = e.target as HTMLElement;
  if (!target.closest(".sort-dropdown-container")) {
    isSortOpen.value = false;
  }
  if (!target.closest(".filter-dropdown-container")) {
    isFilterOpen.value = false;
  }
};

const loadAllTags = async () => {
  if (!props.showTagActions) return;
  allTags.value = await tagService.getAll();
};

onMounted(async () => {
  document.addEventListener("click", closeDropdowns);
  await loadAllTags();
});

onUnmounted(() => {
  document.removeEventListener("click", closeDropdowns);
});

const selectSortOption = (val: string) => {
  emit("update:sortOption", val);
  isSortOpen.value = false;
};

const toggleFilter = () => {
  isFilterOpen.value = !isFilterOpen.value;
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

    await tagService.create({ name });
    addToast({
      title: "Etiqueta creada",
      message: "La etiqueta se ha creado correctamente.",
      type: "success",
    });

    newTagName.value = "";
    showTagModal.value = false;
    await loadAllTags();
    emit("tagCreated");
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

const handleDeleteTag = (tag: Tag) => {
  tagToDelete.value = tag;
  showDeleteTagModal.value = true;
  isFilterOpen.value = false;
};

const confirmDeleteTag = async () => {
  const tag = tagToDelete.value;
  if (!tag) return;

  isDeletingTag.value = true;
  try {
    const tagName = tag.name;
    emit("tagDeleted", tagName);
    await tagService.delete(tag.id);

    if (props.selectedTag === tagName) {
      emit("update:selectedTag", null);
    }

    addToast({
      title: "Etiqueta eliminada",
      message: `La etiqueta "#${tagName}" fue eliminada.`,
      type: "success",
    });

    showDeleteTagModal.value = false;
    tagToDelete.value = null;
    await loadAllTags();
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
  emit("update:selectedTag", tagName);
  isFilterOpen.value = false;
};

defineExpose({
  closeFilters: () => (isFilterOpen.value = false),
  loadAllTags,
});
</script>

<template>
  <div class="flex items-center justify-center sm:justify-end w-full gap-2">
    <!-- View Toggle Button -->
    <button
      v-if="showViewToggle"
      @click="$emit('toggleView')"
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

    <!-- Crear Etiqueta -->
    <button
      v-if="showTagActions"
      @click="showTagModal = true"
      class="text-black/40 hover:text-black/80 transition-all duration-200 cursor-pointer flex items-center justify-center rounded-xl border border-black/8 bg-white hover:border-black/15 hover:shadow-sm h-[38px] w-[38px]"
      title="Crear nueva etiqueta"
    >
      <span class="material-symbols-outlined text-[20px]">new_label</span>
    </button>

    <!-- Slot para acciones extra -->
    <slot name="actions"></slot>

    <!-- Filter Dropdown -->
    <div
      v-if="showFilter"
      class="filter-dropdown-container relative flex items-center bg-white border border-black/8 rounded-xl hover:border-black/15 hover:shadow-sm transition-all duration-200 font-['Manrope'] h-[38px]"
    >
      <div
        @click="toggleFilter"
        class="relative flex items-center py-2 px-3 cursor-pointer group gap-1.5"
      >
        <span
          class="material-symbols-outlined text-[17px] text-black/40 group-hover:text-black/70 transition-colors"
          :class="{ 'text-black! opacity-100': filterLabel && filterLabel !== 'Todas' }"
        >
          filter_list
        </span>
        <span
          class="text-[13px] font-semibold text-black/60 group-hover:text-black/80 transition-colors select-none"
          :class="{ 'text-black!': filterLabel && filterLabel !== 'Todas' }"
        >
          {{ filterLabel || 'Todas' }}
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
          <slot name="filters"></slot>

          <template v-if="showTagActions">
            <div v-if="$slots.filters" class="h-px bg-black/5 my-1 mx-3"></div>

            <div class="px-3 pt-2 pb-1.5 text-center">
              <span
                class="text-[10px] font-bold text-black/30 uppercase tracking-widest"
              >
                Etiquetas
              </span>
            </div>

            <div
              v-for="tag in allTags"
              :key="tag.id"
              class="group/item flex items-center mx-1.5 rounded-lg transition-colors"
              :class="selectedTag === tag.name ? 'bg-black/5' : 'hover:bg-black/4'"
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
              Sin etiquetas
            </div>
          </template>
        </div>
      </transition>
    </div>

    <!-- Sorting Dropdown -->
    <div
      v-if="showSort"
      class="sort-dropdown-container relative flex items-center bg-white border border-black/8 rounded-xl hover:border-black/15 hover:shadow-sm transition-all duration-200 font-['Manrope'] h-[38px]"
    >
      <div
        @click="isSortOpen = !isSortOpen"
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
          {{ selectedSortLabel }}
        </span>
        <span
          class="material-symbols-outlined text-[16px] text-black/30 transition-transform duration-300"
          :class="isSortOpen ? 'rotate-180' : ''"
        >
          expand_more
        </span>
      </div>

      <div class="w-px h-4 bg-black/8 mx-1"></div>

      <button
        @click="$emit('toggleSortOrder')"
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
          v-if="isSortOpen"
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
            v-for="option in props.sortOptions"
            :key="option.value"
            @click="selectSortOption(option.value)"
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
</template>
