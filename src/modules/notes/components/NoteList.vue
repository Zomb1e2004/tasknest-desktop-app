<script setup lang="ts">
import { motion } from "motion-v";
import type { Note } from "../models/NoteModel";
import NoteCard from "./NoteCard.vue";
import ActionCard from "../../../shared/components/ActionCard.vue";
import NoContent from "../../../shared/components/NoContent.vue";
import { useRouter } from "vue-router";

import { useNotesView } from "../composables/useNotesView";
import { noteService } from "../services/NoteService";
import NoteFormatModal from "./NoteFormatModal.vue";
import { ref } from "vue";

const router = useRouter();
const { isGridView } = useNotesView();
const showFormatModal = ref(false);

const handleAddNote = (format: "md" | "txt") => {
  showFormatModal.value = false;
  router.push({ name: "add-note", query: { format } });
};

defineProps<{
  notes: Note[];
}>();

defineEmits<{
  (e: "delete"): void;
  (e: "update"): void;
}>();

const handleSelectNote = async (note: Note) => {
  await noteService.incrementVisits(note.id);
  router.push({
    name: "update-note",
    params: { id: note.id },
    state: {
      note: JSON.parse(JSON.stringify(note)),
      from: router.currentRoute.value.path,
    },
  });
};
</script>

<template>
  <div class="flex flex-col w-full font-['Manrope']">
    <motion.div
      v-if="notes.length > 0"
      layout
      :class="[
        'gap-6 grid',
        isGridView
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          : 'grid-cols-1',
      ]"
    >
      <ActionCard
        icon="add"
        text="Añadir nueva nota"
        variant="dark"
        :class="
          isGridView ? 'w-full min-h-[220px]' : 'w-full shrink-0 min-h-[140px]'
        "
        @click="showFormatModal = true"
      />

      <NoteCard
        v-for="(note, index) in notes"
        :key="note.id"
        :note="note"
        :index="index + 1"
        :class="isGridView ? 'w-full' : 'w-full'"
        :show-options="true"
        date-type="both"
        :show-visits="true"
        class="cursor-pointer"
        @delete="$emit('delete')"
        @toggle-pin="$emit('update')"
        @click="handleSelectNote(note)"
      />
    </motion.div>

    <div v-else class="flex flex-col gap-8">
      <ActionCard
        icon="add"
        text="Añadir tu primera nota"
        variant="dark"
        class="w-full min-h-[180px]"
        @click="showFormatModal = true"
      />
      <NoContent
        icon="article"
        title="Tu libreta está vacía"
        description="Este es el lugar perfecto para capturar tus ideas, tareas y pensamientos más importantes. Crea tu primera nota para empezar."
      />
    </div>

    <NoteFormatModal
      :show="showFormatModal"
      @close="showFormatModal = false"
      @select="handleAddNote"
    />
  </div>
</template>
