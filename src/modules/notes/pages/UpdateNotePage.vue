<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import type { Note } from "../models/NoteModel";
import ActionFooter from "../../../shared/components/ActionFooter.vue";
import Page from "../../../shared/components/Page.vue";
import NoteTitleInput from "../components/NoteTitleInput.vue";
import NoteContentInput from "../components/NoteContentInput.vue";
import { noteService } from "../services/NoteService";
import { useToast } from "../../../shared/composables/useToast";

const router = useRouter();
const { addToast } = useToast();

const note = history.state?.note as Note | undefined;

const noteTitle = ref(note?.title ?? "");
const noteContent = ref(note?.content ?? "");
const originalTitle = ref(note?.title ?? "");
const originalContent = ref(note?.content ?? "");
const isSaving = ref(false);

const hasChanges = computed(() => {
  return (
    noteTitle.value !== originalTitle.value ||
    noteContent.value !== originalContent.value
  );
});

const handleCancel = () => {
  const from = history.state?.from || "/dashboard";
  router.push(from);
};

const handleUpdate = async () => {
  if (!note || !note.id) return;

  if (!noteTitle.value.trim()) {
    addToast({
      title: "Título requerido",
      message: "El título no puede estar vacío.",
      type: "error",
    });
    return;
  }

  isSaving.value = true;
  try {
    await noteService.update(note.id, {
      title: noteTitle.value,
      content: noteContent.value,
    });

    note.title = noteTitle.value;
    note.content = noteContent.value;
    originalTitle.value = noteTitle.value;
    originalContent.value = noteContent.value;

    addToast({
      title: "Nota actualizada",
      message: "Los cambios se han guardado correctamente.",
      type: "success",
    });
  } catch (error) {
    addToast({
      title: "Error",
      message: "No se pudo actualizar la nota.",
      type: "error",
    });
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <Page class="flex flex-col h-full min-h-0">
    <div class="flex flex-col gap-4 sm:gap-5.5 flex-1 min-h-0 w-full">
      <NoteTitleInput v-model="noteTitle" />
      <NoteContentInput
        v-model="noteContent"
        :format="note?.format ?? 'txt'"
        :pinned="note?.isPinned"
        :noteId="note?.id"
        class="flex-1 min-h-0"
      />
    </div>
  </Page>

  <ActionFooter
    saveLabel="Guardar cambios"
    cancelLabel="Volver"
    :isSaving="isSaving"
    :saveDisabled="!noteTitle.trim() || !hasChanges"
    @cancel="handleCancel"
    @save="handleUpdate"
  />
</template>
