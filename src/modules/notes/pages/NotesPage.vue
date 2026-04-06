<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useUser } from "../../../shared/composables/useUser";

import Page from "../../../shared/components/Page.vue";
import NotesHeader from "../components/NotesHeader.vue";
import OrderNotesBy from "../components/OrderNotesBy.vue";
import NoteList from "../components/NoteList.vue";

import { useNotesSort } from "../composables/useNotesSort";
import { noteService } from "../services/NoteService";

import type { Note } from "../../notes/models/NoteModel";
import ScrollToTop from "../../../shared/components/ScrollToTop.vue";
import ScrollDown from "../../../shared/components/ScrollDown.vue";

const { userName } = useUser();
const notes = ref<Note[]>([]);
const { getSortedNotes } = useNotesSort();
const sortedNotes = getSortedNotes(notes);

const loadNotes = async () => {
  notes.value = await noteService.getAll();
};

onMounted(loadNotes);
</script>

<template>
  <Page>
    <div class="flex flex-col gap-6 md:gap-8">
      <NotesHeader :user-name="userName" />
      <OrderNotesBy />
    </div>
    <div class="mt-6">
      <NoteList :notes="sortedNotes" @delete="loadNotes" @update="loadNotes" />
    </div>

    <ScrollToTop />
    <ScrollDown />
  </Page>
</template>
