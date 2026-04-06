<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { motion } from "motion-v";
import type { Note } from "../models/NoteModel";
import StatusModal from "../../../shared/components/StatusModal.vue";
import { noteService } from "../services/NoteService";
import { tagService } from "../services/TagService";
import { useToast } from "../../../shared/composables/useToast";
import type { Tag } from "../models/TagModel";
import NoteExportModal from "./NoteExportModal.vue";
import NoteDeleteModal from "./NoteDeleteModal.vue";
import NoteTagModal from "./NoteTagModal.vue";
import NoteOptions from "./NoteOptions.vue";

const props = withDefaults(
  defineProps<{
    note: Note;
    index?: number;
    showOptions?: boolean;
    showVisits?: boolean;
    showPin?: boolean;
    showTags?: boolean;
    dateType?: "createdAt" | "updatedAt" | "both";
  }>(),
  {
    index: 0,
    showOptions: false,
    showVisits: false,
    showPin: true,
    showTags: true,
    dateType: "updatedAt",
  },
);

const emit = defineEmits<{
  (e: "delete", id: string): void;
  (e: "togglePin", id: string, isPinned: boolean): void;
  (e: "tagCreated"): void;
}>();

const { addToast } = useToast();

const getRelativeTime = (date: number, type: "createdAt" | "updatedAt") => {
  const diffMs = Date.now() - date;
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

  const prefix = type === "createdAt" ? "Creado" : "Actualizado";

  if (diffHrs < 1) return `${prefix} hace poco`;
  if (diffHrs < 24) return `${prefix} hace ${diffHrs}h`;

  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${prefix} hace ${diffDays}d`;

  return `${prefix} el ${new Date(date).toLocaleDateString("es-ES", { month: "short", day: "numeric" })}`;
};

const isOptionsOpen = ref(false);
const optionsButtonRef = ref<HTMLElement | null>(null);
const dropdownPos = ref({ top: 0, left: 0 });

const toggleOptions = () => {
  if (!isOptionsOpen.value && optionsButtonRef.value) {
    const rect = optionsButtonRef.value.getBoundingClientRect();
    dropdownPos.value = {
      top: rect.bottom + window.scrollY + 8,
      left: rect.right + window.scrollX - 160,
    };
  }
  isOptionsOpen.value = !isOptionsOpen.value;
};

const closeOptions = (e: Event) => {
  const target = e.target as HTMLElement;
  if (!target.closest(".options-container")) {
    isOptionsOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", closeOptions);
});

onUnmounted(() => {
  document.removeEventListener("click", closeOptions);
});

const showExportModal = ref(false);
const exportStatus = ref<{
  show: boolean;
  type: "success" | "error";
  title: string;
  message: string;
}>({
  show: false,
  type: "success",
  title: "",
  message: "",
});

const handleExportClick = () => {
  isOptionsOpen.value = false;
  showExportModal.value = true;
};

const showDeleteModal = ref(false);

const handleDeleteClick = () => {
  isOptionsOpen.value = false;
  showDeleteModal.value = true;
};

const handleConfirmDelete = async () => {
  try {
    await noteService.delete(props.note.id);
    showDeleteModal.value = false;
    emit("delete", props.note.id);
    addToast({
      title: "Nota eliminada",
      message: "La nota se ha borrado correctamente.",
      type: "success",
    });
  } catch (error) {
    addToast({
      title: "Error",
      message: "No se pudo eliminar la nota.",
      type: "error",
    });
  }
};

const handleTogglePin = async () => {
  try {
    const newPinnedStatus = !props.note.isPinned;
    await noteService.update(props.note.id, { isPinned: newPinnedStatus });
    emit("togglePin", props.note.id, newPinnedStatus);
    addToast({
      title: newPinnedStatus ? "Nota fijada" : "Nota desfijada",
      message: newPinnedStatus
        ? "La nota aparecerá al principio de la lista."
        : "La nota ya no aparecerá al principio.",
      type: "success",
    });
  } catch (error) {
    addToast({
      title: "Error",
      message: "No se pudo cambiar el estado de la nota.",
      type: "error",
    });
  }
};

const showTagModal = ref(false);
const newTag = ref("");
const allTags = ref<Tag[]>([]);

const loadTags = async () => {
  allTags.value = await tagService.getAll();
};

const handleTagsClick = () => {
  isOptionsOpen.value = false;
  showTagModal.value = true;
  loadTags();
};

const addTag = async (tagName: string) => {
  const cleanName = tagName.trim().toLowerCase();
  if (!cleanName) return;

  if (props.note.tags.includes(cleanName)) {
    addToast({
      title: "Etiqueta ya existe",
      message: "Esta nota ya tiene esa etiqueta.",
      type: "error",
    });
    return;
  }

  if (props.note.tags.length >= 3) {
    addToast({
      title: "Límite alcanzado",
      message: "Máximo 3 etiquetas por nota.",
      type: "error",
    });
    return;
  }

  try {
    const existing = await tagService.getByName(cleanName);
    if (!existing) {
      await tagService.create({ name: cleanName });
      emit("tagCreated");
    }

    const updatedTags = [...props.note.tags, cleanName];
    await noteService.update(props.note.id, { tags: updatedTags });
    props.note.tags = updatedTags;
    newTag.value = "";
    addToast({
      title: "Etiqueta añadida",
      message: `Se ha añadido "${cleanName}" a la nota.`,
      type: "success",
    });
  } catch (error) {
    addToast({
      title: "Error",
      message: "No se pudo añadir la etiqueta.",
      type: "error",
    });
  }
};

const removeTag = async (tagName: string) => {
  try {
    const updatedTags = props.note.tags.filter((t) => t !== tagName);
    await noteService.update(props.note.id, { tags: updatedTags });
    props.note.tags = updatedTags;
    addToast({
      title: "Etiqueta eliminada",
      message: "Se ha quitado la etiqueta de la nota.",
      type: "success",
    });
  } catch (error) {
    addToast({
      title: "Error",
      message: "No se pudo eliminar la etiqueta.",
      type: "error",
    });
  }
};

const clearAllTags = async () => {
  try {
    await noteService.update(props.note.id, { tags: [] });
    props.note.tags = [];
    addToast({
      title: "Etiquetas eliminadas",
      message: "Se han quitado todas las etiquetas de la nota.",
      type: "success",
    });
  } catch (error) {
    addToast({
      title: "Error",
      message: "No se pudieron eliminar las etiquetas.",
      type: "error",
    });
  }
};

const downloadNote = async () => {
  const isMd = props.note.format === "md";
  const content = isMd
    ? props.note.content
    : `${props.note.title}\n\n${props.note.content}\n\nCreado el ${new Date(props.note.createdAt).toLocaleDateString("es-ES")}`;

  const extension = isMd ? ".md" : ".txt";
  const mimeType = isMd ? "text/markdown" : "text/plain";
  const suggestedName = `${props.note.title.replace(/\s+/g, "_")}${extension}`;

  try {
    if ("showSaveFilePicker" in window) {
      const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName,
        types: [
          {
            description: isMd ? "Documento Markdown" : "Documento de texto",
            accept: { [mimeType]: [extension] },
          },
        ],
      });
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();
    } else {
      const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = suggestedName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    exportStatus.value = {
      show: true,
      type: "success",
      title: "¡Exportación exitosa!",
      message:
        "Tu nota ha sido exportada y guardada en el formato seleccionado.",
    };
  } catch (error: any) {
    if (error.name !== "AbortError") {
      console.error("Ocurrió un error al intentar guardar la nota:", error);
      exportStatus.value = {
        show: true,
        type: "error",
        title: "Error de exportación",
        message:
          "Ocurrió un problema al intentar guardar tu nota. Por favor inténtalo de nuevo.",
      };
    }
  } finally {
    showExportModal.value = false;
  }
};
</script>

<template>
  <motion.article
    layout
    :initial="{ opacity: 0, y: 0 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.25, ease: 'easeOut' }"
    class="group relative bg-white border border-black/10 rounded-3xl p-4.5 flex flex-col gap-6 shadow-sm hover:shadow-lg hover:border-black/20 transition-all duration-300 cursor-pointer overflow-visible"
    :class="{ 'border-black/30 bg-black/1!': note.isPinned && showPin }"
  >
    <div
      class="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 bg-linear-to-br from-black/2 to-transparent rounded-3xl"
    />

    <div class="flex-1 flex flex-col gap-4 relative z-10">
      <div class="flex items-start justify-between gap-4">
        <div class="flex flex-col gap-2 flex-1 min-w-0">
          <div class="flex items-center gap-2 min-w-0">
            <h3
              class="text-[17px] font-bold text-black/80 leading-snug group-hover:text-black transition-colors truncate"
            >
              {{ note.title }}
            </h3>
          </div>

          <div
            v-if="note.format"
            class="inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/4 border border-black/5 text-black/60 text-[10px] font-bold uppercase tracking-wider group-hover:bg-black/[0.07] group-hover:text-black transition-all"
          >
            <span class="material-symbols-outlined text-[13px]">
              {{ note.format === "md" ? "markdown" : "description" }}
            </span>
            {{ note.format }}
          </div>
        </div>

        <!-- ✅ Solo botones, sin el div relative que envolvía el dropdown -->
        <div
          v-if="showOptions"
          class="flex items-center gap-1 options-container"
        >
          <button
            v-if="showPin"
            @click.stop="handleTogglePin"
            class="flex cursor-pointer items-center justify-center w-8 h-8 rounded-lg transition-all"
            :class="
              note.isPinned
                ? 'text-black bg-black/10 hover:bg-black/15'
                : 'text-black/30 hover:text-black hover:bg-black/5'
            "
            :title="note.isPinned ? 'Desfijar nota' : 'Fijar nota'"
          >
            <span
              class="material-symbols-outlined text-[20px]"
              :class="{ 'fill-1': note.isPinned }"
            >
              keep
            </span>
          </button>

          <!-- ✅ ref agregado aquí -->
          <button
            ref="optionsButtonRef"
            @click.stop="toggleOptions"
            class="flex cursor-pointer items-center justify-center w-8 h-8 rounded-lg text-black/30 hover:text-black hover:bg-black/5 transition-all"
            :class="isOptionsOpen ? 'bg-black/5 text-black' : ''"
          >
            <span class="material-symbols-outlined text-[20px]">
              more_vert
            </span>
          </button>
        </div>
      </div>

      <p
        class="text-[14px] text-black/55 leading-relaxed font-medium line-clamp-3 group-hover:text-black/70 transition-colors"
      >
        {{ note.content }}
      </p>

      <div v-if="showTags" class="flex flex-wrap gap-2 mt-auto">
        <template v-if="note.tags && note.tags.length > 0">
          <div
            v-for="tag in note.tags"
            :key="tag"
            class="px-2 py-0.5 rounded-md bg-black/5 border border-black/5 text-[10px] font-bold text-black/40 uppercase tracking-tight"
          >
            #{{ tag }}
          </div>
        </template>
        <div
          v-else
          class="px-2 py-0.5 rounded-md bg-black/5 border border-black/5 text-[10px] font-bold text-black/40 uppercase tracking-tight"
        >
          Sin etiquetas
        </div>
      </div>
    </div>

    <div
      class="relative z-10 border-t border-black/5 pt-4 flex items-center justify-between gap-4"
    >
      <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
        <template v-if="dateType === 'both'">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[14px] text-black/30">
              calendar_today
            </span>
            <span class="text-[11.5px] font-bold text-black/50">
              {{ getRelativeTime(note.createdAt, "createdAt") }}
            </span>
          </div>

          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[14px] text-black/20">
              update
            </span>
            <span class="text-[11px] font-medium text-black/40">
              {{ getRelativeTime(note.updatedAt, "updatedAt") }}
            </span>
          </div>
        </template>

        <template v-else>
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[14px] text-black/30">
              calendar_today
            </span>
            <span class="text-[11.5px] font-bold text-black/50">
              {{ getRelativeTime(note[dateType], dateType) }}
            </span>
          </div>
        </template>
      </div>

      <div
        v-if="showVisits"
        class="flex items-center gap-1.5 px-3 py-1.5 bg-black/4 rounded-xl text-black/40 group-hover:text-black/80 group-hover:bg-black/8 transition-all shrink-0"
        title="Visitas"
      >
        <span class="material-symbols-outlined text-[16px]"> visibility </span>
        <span class="text-[12px] font-extrabold">
          {{ note.totalVisits || 0 }}
        </span>
      </div>
    </div>

    <Teleport to="body">
      <NoteOptions
        :show="isOptionsOpen"
        :top="dropdownPos.top"
        :left="dropdownPos.left"
        @export="handleExportClick"
        @tags="handleTagsClick"
        @delete="handleDeleteClick"
      />

      <NoteExportModal
        v-if="showExportModal"
        :note="note"
        @confirm="downloadNote"
        @close="showExportModal = false"
      />

      <NoteDeleteModal
        v-if="showDeleteModal"
        @confirm="handleConfirmDelete"
        @close="showDeleteModal = false"
      />

      <StatusModal
        :show="exportStatus.show"
        :type="exportStatus.type"
        :title="exportStatus.title"
        :message="exportStatus.message"
        @close="exportStatus.show = false"
      />

      <NoteTagModal
        v-if="showTagModal"
        :tags="note.tags"
        :all-tags="allTags"
        v-model:new-tag="newTag"
        @add-tag="addTag"
        @remove-tag="removeTag"
        @clear-tags="clearAllTags"
        @close="showTagModal = false"
      />
    </Teleport>
  </motion.article>
</template>
