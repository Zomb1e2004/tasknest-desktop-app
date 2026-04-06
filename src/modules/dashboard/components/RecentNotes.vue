<script setup lang="ts">
import { ref, watch } from "vue";
import { motion } from "motion-v";
import type { Note } from "../../notes/models/NoteModel";
import NoContent from "../../../shared/components/NoContent.vue";
import NoteCard from "../../notes/components/NoteCard.vue";
import { useToast } from "../../../shared/composables/useToast";
import { useRouter } from "vue-router";

import { noteService } from "../../notes/services/NoteService";

const router = useRouter();
const { addToast } = useToast();

const savedView = localStorage.getItem("isGridView_RecentNotes");
const isGridView = ref(savedView ? JSON.parse(savedView) : true);

watch(isGridView, (newVal) => {
  localStorage.setItem("isGridView_RecentNotes", JSON.stringify(newVal));
  addToast({
    title: "Vista actualizada",
    message: newVal
      ? "Cambiado a vista de cuadrícula"
      : "Cambiado a vista de lista",
    type: "info",
    duration: 2000,
  });
});

withDefaults(
  defineProps<{
    notes: Note[];
    maxNotes?: number;
  }>(),
  {
    maxNotes: 3,
  },
);

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

const emit = defineEmits<{
  (e: "delete", id: string): void;
}>();
</script>

<template>
  <section class="font-['Manrope'] w-full">
    <div class="flex items-center justify-between mb-4 px-2">
      <h2 class="text-xl font-bold text-black/90">Notas recientes</h2>
      <div class="flex items-center gap-3">
        <button
          @click="$router.push('/notes')"
          class="text-xs font-bold tracking-[0.15em] uppercase text-black/40 hover:text-black transition-colors cursor-pointer"
        >
          Ver todas
        </button>
        <button
          @click="isGridView = !isGridView"
          class="text-black/30 hover:text-black transition-colors cursor-pointer flex items-center justify-center p-1 rounded-md hover:bg-black/5"
          :title="
            isGridView
              ? 'Cambiar a vista de lista'
              : 'Cambiar a vista de cuadrícula'
          "
        >
          <span class="material-symbols-outlined text-[24px]">{{
            isGridView ? "view_list" : "grid_view"
          }}</span>
        </button>
      </div>
    </div>

    <motion.div
      v-if="notes.length > 0"
      layout
      :class="[
        'gap-6',
        isGridView
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          : 'flex flex-col items-stretch',
      ]"
    >
      <NoteCard
        v-for="(note, index) in notes.slice(0, maxNotes)"
        date-type="updatedAt"
        :key="note.id"
        :note="note"
        :index="index"
        :show-options="false"
        :show-tags="false"
        :show-pin="false"
        :class="isGridView ? 'w-full shrink-0' : 'w-full shrink-0'"
        @delete="emit('delete', $event)"
        @click="handleSelectNote(note)"
      />
    </motion.div>

    <NoContent
      v-else
      icon="article"
      title="Aún no hay notas"
      description="No tienes notas recientes. ¡Empieza creando una nueva!"
    />
  </section>
</template>
