<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { useToast } from "../composables/useToast";
import { motion, AnimatePresence } from "motion-v";
import { useRouter } from "vue-router";
import { noteService } from "../../modules/notes/services/NoteService";
import type { Note } from "../../modules/notes/models/NoteModel";

const { addToast } = useToast();
const router = useRouter();
const isSidebarOpen = defineModel<boolean>("isSidebarOpen");
const notes = ref<Note[]>([]);

const isMobile = ref(window.innerWidth < 640);
const currentTime = ref(new Date());
let timeInterval: any = null;

const handleResize = () => {
  isMobile.value = window.innerWidth < 640;
};

const formattedTime = computed(() => {
  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };
  return currentTime.value.toLocaleTimeString("es-PE", options);
});

const formattedDay = computed(() => {
  const options: Intl.DateTimeFormatOptions = { weekday: "long" };
  const day = currentTime.value.toLocaleDateString("es-PE", options);
  return day.charAt(0).toUpperCase() + day.slice(1);
});

const searchQuery = ref("");
const searchInput = ref<HTMLInputElement | null>(null);
const searchContainer = ref<HTMLElement | null>(null);

watch(searchQuery, async (newQuery) => {
  if (newQuery.length > 0) {
    notes.value = await noteService.getAll();
  }
});

const filteredResults = computed(() => {
  if (searchQuery.value.length < 3) return [];
  const query = searchQuery.value.toLowerCase();
  return notes.value
    .filter((n) => n.title.toLowerCase().includes(query))
    .slice(0, 6);
});

const isSearchOpen = computed(() => filteredResults.value.length > 0);

const toggleBodyScroll = (lock: boolean) => {
  document.body.style.overflow = lock ? "hidden" : "";
};

watch(isSearchOpen, (open) => {
  toggleBodyScroll(open);
});

const handleSelectNote = async (note: Note) => {
  await noteService.incrementVisits(note.id);

  addToast({
    title: "¡Nota encontrada!",
    message: `Abriendo: ${note.title}`,
    type: "success",
    duration: 3000,
  });
  const from =
    router.currentRoute.value.name === "update-note"
      ? history.state?.from || "/dashboard"
      : router.currentRoute.value.path;

  router.push({
    name: "update-note",
    params: { id: note.id },
    state: { note: JSON.parse(JSON.stringify(note)), from },
  });

  searchQuery.value = "";
};

const handleKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    searchInput.value?.focus();
  }
};

const handleClickOutside = (e: MouseEvent) => {
  if (!searchContainer.value) return;

  if (!searchContainer.value.contains(e.target as Node)) {
    searchQuery.value = "";
  }
};

const dropdownStyle = ref({
  top: "0px",
  left: "0px",
  width: "0px",
});

const updateDropdownPosition = () => {
  if (searchContainer.value) {
    const rect = searchContainer.value.getBoundingClientRect();
    dropdownStyle.value = {
      top: `${rect.bottom + 12}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
    };
  }
};

onMounted(async () => {
  window.addEventListener("keydown", handleKeydown);
  window.addEventListener("click", handleClickOutside);
  window.addEventListener("resize", () => {
    handleResize();
    updateDropdownPosition();
  });

  notes.value = await noteService.getAll();

  timeInterval = setInterval(() => {
    currentTime.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("click", handleClickOutside);
  window.removeEventListener("resize", updateDropdownPosition);
  if (timeInterval) clearInterval(timeInterval);
  toggleBodyScroll(false);
});

watch(isSearchOpen, (open) => {
  toggleBodyScroll(open);
  if (open) {
    updateDropdownPosition();
  }
});
</script>

<template>
  <header
    class="h-20 sm:h-24 px-4 md:px-12 flex items-center justify-between bg-transparent backdrop-blur-md border-b border-black/10 sticky top-0 z-50 w-full font-['Manrope'] select-none gap-4"
  >
    <div class="flex-1 max-w-2xl flex items-center gap-2 sm:gap-4">
      <button
        @click="isSidebarOpen = !isSidebarOpen"
        class="flex items-center justify-center p-2 rounded-xl text-black/50 hover:text-black hover:bg-black/5 transition-colors cursor-pointer lg:hidden"
        title="Menú"
      >
        <span class="material-symbols-outlined text-[24px] sm:text-[26px]"
          >menu</span
        >
      </button>

      <div ref="searchContainer" class="relative flex-1">
        <span
          class="material-symbols-outlined text-black/50 absolute left-4 top-1/2 -translate-y-1/2 transition-colors focus-within:text-black text-[20px] sm:text-[22px]"
        >
          search
        </span>

        <input
          ref="searchInput"
          v-model="searchQuery"
          @focus="
            async () => {
              notes = await noteService.getAll();
              updateDropdownPosition();
            }
          "
          type="text"
          :placeholder="
            isMobile ? 'Buscar...' : 'Buscar rápidamente tareas o notas...'
          "
          class="w-full bg-white hover:bg-black/5 focus:bg-black/5 text-black placeholder-black/50 rounded-2xl py-2.5 sm:py-3.5 pl-11 sm:pl-12 pr-4 sm:pr-16 outline-none border border-black focus:border-black focus:shadow-sm transition-all duration-300 text-sm font-medium"
        />

        <Teleport to="body">
          <AnimatePresence>
            <motion.div
              v-if="filteredResults.length > 0"
              initial="{ opacity: 0, y: 10, filter: 'blur(4px)' }"
              animate="{ opacity: 1, y: 0, filter: 'blur(0px)' }"
              exit="{ opacity: 0, y: 10, filter: 'blur(4px)' }"
              :style="{
                position: 'fixed',
                top: dropdownStyle.top,
                left: dropdownStyle.left,
                width: dropdownStyle.width,
              }"
              class="bg-white border border-black/10 rounded-2xl shadow-xl overflow-hidden z-100 select-none"
            >
              <div class="p-2 flex flex-col">
                <div
                  v-for="note in filteredResults"
                  :key="'search-' + note.id"
                  @click="handleSelectNote(note)"
                  class="flex items-center gap-3 p-3 hover:bg-black/5 rounded-xl transition-all cursor-pointer group"
                >
                  <!-- Icono -->
                  <div
                    class="w-8 h-8 bg-black/5 rounded-lg flex items-center justify-center text-black/40 group-hover:bg-black group-hover:text-white transition-all"
                  >
                    <span class="material-symbols-outlined text-[18px]">
                      description
                    </span>
                  </div>

                  <!-- Info -->
                  <div class="flex flex-col">
                    <span class="text-sm font-bold text-black/80 truncate">
                      {{ note.title }}
                    </span>
                    <span class="text-[11px] text-black/40 font-medium">
                      {{ new Date(note.createdAt).toLocaleDateString("es-ES") }}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </Teleport>

        <div
          v-if="!searchQuery"
          class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none"
        >
          <kbd
            class="hidden sm:inline-flex items-center justify-center px-1.5 py-1 text-[10px] font-bold text-black/60 bg-black/10 rounded-md"
          >
            Ctrl + K
          </kbd>
        </div>
      </div>
    </div>

    <div class="hidden md:flex flex-col items-end gap-1 select-none pr-2">
      <span
        class="text-lg font-black text-black/90 tracking-tighter leading-none tabular-nums"
      >
        {{ formattedTime }}
      </span>
      <span
        class="text-[17px] text-black/40 font-bold uppercase tracking-widest leading-none"
      >
        {{ formattedDay }}
      </span>
    </div>
  </header>
</template>
