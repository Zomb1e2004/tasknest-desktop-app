<script setup lang="ts">
import Modal from "../../../shared/components/Modal.vue";
import Button from "../../../shared/components/Button.vue";
import type { Note } from "../models/NoteModel";

const props = defineProps<{
  note: Note;
}>();

const emit = defineEmits<{
  (e: "confirm"): void;
  (e: "close"): void;
}>();
</script>

<template>
  <Modal :close-on-click-outside="true" @close="emit('close')">
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
        <Button variant="ghost" @click="emit('close')">Cancelar</Button>
        <Button @click="emit('confirm')">Descargar</Button>
      </div>
    </div>
  </Modal>
</template>
