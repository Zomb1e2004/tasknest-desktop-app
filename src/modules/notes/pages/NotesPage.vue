<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useUser } from "../../../shared/composables/useUser";

import Page from "../../../shared/components/Page.vue";
import NotesHeader from "../components/NotesHeader.vue";
import NoteListTool from "../components/NoteListTool.vue";
import NoteList from "../components/NoteList.vue";

import { useNotesSort } from "../composables/useNotesSort";
import { useNotesFilter } from "../composables/useNotesFilter";
import { noteService } from "../services/NoteService";

import type { Note } from "../../notes/models/NoteModel";
import ScrollToTop from "../../../shared/components/ScrollToTop.vue";
import ScrollDown from "../../../shared/components/ScrollDown.vue";

const { userName } = useUser();
const notes = ref<Note[]>([]);
const { selectedTag, selectedFormat } = useNotesFilter();
const { getSortedNotes } = useNotesSort();
const noteListToolRef = ref<any>(null);

const filteredNotes = computed(() => {
  return notes.value.filter((note) => {
    const matchesTag = !selectedTag.value || note.tags?.includes(selectedTag.value);
    const matchesFormat = !selectedFormat.value || note.format === selectedFormat.value;
    return matchesTag && matchesFormat;
  });
});

const sortedNotes = getSortedNotes(filteredNotes);

const loadNotes = async () => {
  notes.value = await noteService.getAll();
};

const handleTagCreated = async () => {
  if (noteListToolRef.value) {
    await noteListToolRef.value.loadAllTags();
  }
};

onMounted(loadNotes);
</script>

<template>
  <Page>
    <div class="flex flex-col gap-6 md:gap-8">
      <NotesHeader :user-name="userName" />
      <NoteListTool ref="noteListToolRef" @tag-deleted="loadNotes" />
    </div>
    <div class="mt-6">
      <NoteList
        :notes="sortedNotes"
        @delete="loadNotes"
        @update="loadNotes"
        @tag-created="handleTagCreated"
      />
    </div>

    <ScrollToTop />
    <ScrollDown />
  </Page>
</template>
