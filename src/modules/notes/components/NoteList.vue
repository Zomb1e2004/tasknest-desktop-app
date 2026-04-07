<script setup lang="ts">
import type { Note } from "../models/NoteModel";
import NoteCard from "./NoteCard.vue";
import ActionCard from "../../../shared/components/ActionCard.vue";
import NoContent from "../../../shared/components/NoContent.vue";
import { useRouter } from "vue-router";
import List from "../../../shared/components/List.vue";

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
  (e: "tagCreated"): void;
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
  <List :items="notes" :is-grid-view="isGridView" cols="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    <template #action-card>
      <ActionCard
        icon="add"
        :text="notes.length > 0 ? 'Añadir nueva nota' : 'Añadir tu primera nota'"
        variant="dark"
        :class="
          notes.length > 0
            ? isGridView
              ? 'w-full min-h-[220px]'
              : 'w-full shrink-0 min-h-[140px]'
            : 'w-full min-h-[180px]'
        "
        @click="showFormatModal = true"
      />
    </template>

    <template #item="{ item, index }">
      <NoteCard
        :note="(item as Note)"
        :index="index + 1"
        :class="isGridView ? 'w-full' : 'w-full'"
        :show-options="true"
        :show-date="true"
        :show-last-seen="true"
        date-type="both"
        :show-visits="true"
        class="cursor-pointer"
        @delete="$emit('delete')"
        @toggle-pin="$emit('update')"
        @tag-created="$emit('tagCreated')"
        @click="handleSelectNote((item as Note))"
      />
    </template>

    <template #empty-state>
      <NoContent
        icon="article"
        title="Tu libreta está vacía"
        description="Este es el lugar perfecto para capturar tus ideas, tareas y pensamientos más importantes. Crea tu primera nota para empezar."
      />
    </template>
  </List>

  <NoteFormatModal
    :show="showFormatModal"
    @close="showFormatModal = false"
    @select="handleAddNote"
  />
</template>
