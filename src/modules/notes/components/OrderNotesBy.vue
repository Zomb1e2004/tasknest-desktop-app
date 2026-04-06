<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useNotesSort } from "../composables/useNotesSort";
import { useNotesView } from "../composables/useNotesView";

const { sortOption, sortOrder } = useNotesSort();
const { isGridView, toggleView } = useNotesView();
const isDropdownOpen = ref(false);

const options = [
  { value: "title", label: "Título" },
  { value: "totalVisits", label: "Visitas" },
  { value: "createdAt", label: "Fecha de creación" },
  { value: "updatedAt", label: "Fecha de modificación" },
];

const selectedLabel = computed(() => {
  return options.find((o) => o.value === sortOption.value)?.label || "";
});

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
};

const selectOption = (val: string) => {
  sortOption.value = val;
  isDropdownOpen.value = false;
};

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const closeDropdown = (e: Event) => {
  const target = e.target as HTMLElement;
  if (!target.closest(".custom-dropdown-container")) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener("click", closeDropdown);
});
</script>

<template>
  <div class="flex items-center justify-center sm:justify-end w-full gap-3">
    <!-- View Toggle Button (New Position) -->
    <button
      @click="toggleView"
      class="text-black/30 hover:text-black transition-colors cursor-pointer flex items-center justify-center p-2 rounded-xl border border-black/10 bg-white hover:border-black/20 hover:shadow-md h-[42px] w-[42px]"
      :title="
        isGridView
          ? 'Cambiar a vista de lista'
          : 'Cambiar a vista de cuadrícula'
      "
    >
      <span class="material-symbols-outlined text-[22px]">{{
        isGridView ? "view_list" : "grid_view"
      }}</span>
    </button>

    <!-- Sorting Dropdown -->
    <div
      class="custom-dropdown-container relative flex items-center bg-white border border-black/10 rounded-xl shadow-sm hover:border-black/20 hover:shadow-md transition-all duration-300 font-['Manrope'] h-[42px]"
    >
      <div
        @click="toggleDropdown"
        class="relative flex items-center py-2 pl-3 pr-2 cursor-pointer group"
      >
        <span
          class="material-symbols-outlined text-[18px] text-black/50 group-hover:text-black/80 transition-colors mr-2"
        >
          sort
        </span>
        <span
          class="text-sm font-bold text-black/70 group-hover:text-black/90 transition-colors mr-1 select-none"
        >
          {{ selectedLabel }}
        </span>
        <span
          class="material-symbols-outlined text-[18px] text-black/40 transition-transform duration-300"
          :class="isDropdownOpen ? 'rotate-180' : ''"
        >
          expand_more
        </span>
      </div>

      <div class="w-px h-5 bg-black/10 mx-1"></div>

      <button
        @click="toggleSortOrder"
        class="py-2.5 px-3 text-black/50 hover:text-black hover:bg-black/5 transition-colors rounded-r-xl flex items-center justify-center cursor-pointer group"
        :title="sortOrder === 'desc' ? 'Orden descendente' : 'Orden ascendente'"
      >
        <span
          class="material-symbols-outlined text-[18px] transition-transform duration-500 transform"
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
          class="absolute top-full left-0 mt-2 min-w-full bg-white border border-black/10 rounded-xl shadow-lg shadow-black/5 z-20 overflow-hidden origin-top-left py-1.5"
        >
          <button
            v-for="option in options"
            :key="option.value"
            @click="selectOption(option.value)"
            class="w-full cursor-pointer text-left px-4 py-2.5 text-sm font-semibold transition-colors flex items-center justify-between"
            :class="
              sortOption === option.value
                ? 'bg-black/5 text-black'
                : 'text-black/60 hover:bg-black/5 hover:text-black'
            "
          >
            {{ option.label }}
            <span
              v-if="sortOption === option.value"
              class="material-symbols-outlined text-[16px]"
              >check</span
            >
          </button>
        </div>
      </transition>
    </div>
  </div>
</template>
