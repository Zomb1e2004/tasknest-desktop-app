<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { motion } from "motion-v";
import type { Note } from "../models/NoteModel";
import Modal from "../../../shared/components/Modal.vue";
import Button from "../../../shared/components/Button.vue";
import StatusModal from "../../../shared/components/StatusModal.vue";
import { noteService } from "../services/NoteService";
import { useToast } from "../../../shared/composables/useToast";

const props = withDefaults(
  defineProps<{
    note: Note;
    index?: number;
    showOptions?: boolean;
    showVisits?: boolean;
    showPin?: boolean;
    dateType?: "createdAt" | "updatedAt" | "both";
  }>(),
  {
    index: 0,
    showOptions: false,
    showVisits: false,
    showPin: true,
    dateType: "updatedAt",
  },
);

const emit = defineEmits<{
  (e: "delete", id: string): void;
  (e: "togglePin", id: string, isPinned: boolean): void;
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

const toggleOptions = () => {
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
    class="group relative bg-white border border-black/10 rounded-3xl p-4.5 flex flex-col gap-6 shadow-sm hover:shadow-lg hover:border-black/20 transition-all duration-300 cursor-pointer overflow-hidden"
    :class="{ 'border-black/30 bg-black/1!': note.isPinned && showPin }"
  >
    <div
      class="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 bg-linear-to-br from-black/2 to-transparent"
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

        <div
          v-if="showOptions"
          class="relative flex items-center gap-1 options-container"
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

          <button
            @click.stop="toggleOptions"
            class="flex cursor-pointer items-center justify-center w-8 h-8 rounded-lg text-black/30 hover:text-black hover:bg-black/5 transition-all"
            :class="isOptionsOpen ? 'bg-black/5 text-black' : ''"
          >
            <span class="material-symbols-outlined text-[20px]">
              more_vert
            </span>
          </button>

          <transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="scale-95 opacity-0"
            enter-to-class="scale-100 opacity-100"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="scale-100 opacity-100"
            leave-to-class="scale-95 opacity-0"
          >
            <div
              v-if="isOptionsOpen"
              class="absolute top-full right-0 mt-2 w-40 bg-white border border-black/10 rounded-xl shadow-xl z-20 py-1.5 overflow-hidden"
            >
              <button
                @click.stop="handleExportClick"
                class="w-full cursor-pointer text-left px-4 py-2.5 text-sm font-semibold text-black/60 hover:text-black hover:bg-black/5 transition flex items-center gap-2"
              >
                <span class="material-symbols-outlined text-[16px]">
                  file_download
                </span>
                Exportar
              </button>

              <button
                @click.stop="handleDeleteClick"
                class="w-full cursor-pointer text-left px-4 py-2.5 text-sm font-semibold text-[#D32F2F]/80 hover:text-[#D32F2F] hover:bg-[#D32F2F]/10 transition flex items-center gap-2"
              >
                <span class="material-symbols-outlined text-[16px]">
                  delete
                </span>
                Eliminar
              </button>
            </div>
          </transition>
        </div>
      </div>

      <p
        class="text-[14px] text-black/55 leading-relaxed font-medium line-clamp-3 group-hover:text-black/70 transition-colors"
      >
        {{ note.content }}
      </p>
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
      <Modal
        :close-on-click-outside="true"
        v-if="showExportModal"
        @close="showExportModal = false"
      >
        <div class="flex flex-col gap-6 w-full text-left">
          <div class="flex flex-col gap-2">
            <div
              class="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center mb-1"
            >
              <span class="material-symbols-outlined text-[24px] text-black">
                {{ note.format === "md" ? "markdown" : "file_download" }}
              </span>
            </div>
            <h3 class="text-xl font-bold text-black leading-tight">
              Exportar como {{ note.format.toUpperCase() }}
            </h3>
            <p
              v-if="note.format === 'txt'"
              class="text-black/60 font-medium text-[14px] leading-relaxed"
            >
              La nota será descargada con la siguiente estructura clásica:
            </p>
            <p
              v-else
              class="text-black/60 font-medium text-[14px] leading-relaxed"
            >
              La nota será descargada en su formato
              <span class="font-bold text-black">raw</span> original, sin
              estructuras adicionales.
            </p>
          </div>

          <div
            v-if="note.format === 'txt'"
            class="bg-black/5 p-4 rounded-xl border border-black/10 flex flex-col gap-1 text-[13px] text-black/80 font-medium font-mono"
          >
            <span>{{ note.title }}</span>
            <br />
            <span>{Contenido}</span>
            <br />
            <span
              >Creado el
              {{ new Date(note.createdAt).toLocaleDateString("es-ES") }}</span
            >
          </div>

          <div
            v-else
            class="bg-black/5 p-4 rounded-xl border border-black/10 flex flex-col gap-1 text-[13px] text-black/80 font-medium font-mono"
          >
            <span>{Contenido Raw}</span>
          </div>

          <div class="flex items-center justify-end gap-3 mt-2">
            <Button variant="ghost" @click="showExportModal = false">
              Cancelar
            </Button>
            <Button @click="downloadNote">Descargar</Button>
          </div>
        </div>
      </Modal>

      <Modal
        :close-on-click-outside="true"
        v-if="showDeleteModal"
        @close="showDeleteModal = false"
      >
        <div class="flex flex-col gap-6 w-full text-left">
          <div class="flex flex-col gap-2">
            <div
              class="w-12 h-12 bg-[#D32F2F]/10 rounded-2xl flex items-center justify-center mb-1"
            >
              <span
                class="material-symbols-outlined text-[24px] text-[#D32F2F]"
              >
                delete_forever
              </span>
            </div>
            <h3 class="text-xl font-bold text-black leading-tight">
              ¿Eliminar nota?
            </h3>
            <p class="text-black/60 font-medium text-[14px] leading-relaxed">
              Esta acción es
              <span class="font-bold text-black">permanente e irreversible</span
              >. La nota desaparecerá por completo de tu sistema.
            </p>
          </div>

          <div class="flex items-center justify-end gap-3 mt-2">
            <Button variant="ghost" @click="showDeleteModal = false">
              Cancelar
            </Button>
            <Button
              class="bg-[#D32F2F]! text-white! hover:bg-[#B71C1C]!"
              @click="handleConfirmDelete"
            >
              Sí, eliminar
            </Button>
          </div>
        </div>
      </Modal>

      <StatusModal
        :show="exportStatus.show"
        :type="exportStatus.type"
        :title="exportStatus.title"
        :message="exportStatus.message"
        @close="exportStatus.show = false"
      />
    </Teleport>
  </motion.article>
</template>
