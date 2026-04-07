<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import ActionFooter from "../../../shared/components/ActionFooter.vue";
import Page from "../../../shared/components/Page.vue";
import NoteTitleInput from "../components/NoteTitleInput.vue";
import NoteContentInput from "../components/NoteContentInput.vue";
import { noteService } from "../services/NoteService";
import { useToast } from "../../../shared/composables/useToast";

const router = useRouter();
const { addToast } = useToast();

const format = (router.currentRoute.value.query.format as "md" | "txt") || "md";
const noteTitle = ref("");
const noteContent = ref("");
const isSaving = ref(false);

const handleCancel = () => {
  router.back();
};

const handleSave = async () => {
  if (!noteTitle.value.trim()) {
    addToast({
      title: "Título requerido",
      message: "Por favor ingresa un título para la nota.",
      type: "error",
    });
    return;
  }

  isSaving.value = true;
  try {
    await noteService.create({
      title: noteTitle.value,
      content: noteContent.value,
      tags: [],
      totalVisits: 1,
      format: format,
      isPinned: false
    });

    addToast({
      title: "Nota guardada",
      message: "La nota se ha creado correctamente.",
      type: "success",
    });

    router.back();
  } catch (error) {
    addToast({
      title: "Error",
      message: "No se pudo guardar la nota.",
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
      <div class="flex items-center justify-between gap-4">
        <NoteTitleInput v-model="noteTitle" class="flex-1" />
      </div>
      <NoteContentInput
        v-model="noteContent"
        :format="format"
        class="flex-1 min-h-0"
      />
    </div>
  </Page>

  <ActionFooter
    :isSaving="isSaving"
    :saveDisabled="!noteTitle.trim()"
    @cancel="handleCancel"
    @save="handleSave"
  />
</template>
