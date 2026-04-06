<script setup lang="ts">
import Modal from "../../../shared/components/Modal.vue";
import Button from "../../../shared/components/Button.vue";
import type { Tag } from "../models/TagModel";

defineProps<{
  tag: Tag;
  isDeleting: boolean;
}>();

const emit = defineEmits<{
  (e: "confirm"): void;
  (e: "close"): void;
}>();
</script>

<template>
  <Modal
    @close="emit('close')"
    :close-on-click-outside="!isDeleting"
  >
    <div class="flex flex-col gap-6 w-full text-left font-['Manrope']">
      <div class="flex flex-col gap-2">
        <div
          class="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-1"
        >
          <span class="material-symbols-outlined text-[24px] text-red-500">
            delete_forever
          </span>
        </div>
        <h3 class="text-xl font-bold text-black leading-tight">
          ¿Eliminar etiqueta?
        </h3>
        <p class="text-black/60 font-medium text-[14px] leading-relaxed">
          La etiqueta
          <span class="font-bold text-black">#{{ tag.name }}</span>
          será eliminada permanentemente y
          <span class="font-bold text-black">removida de todas las notas</span>
          que la tengan asignada.
        </p>
      </div>

      <div class="flex items-center justify-end gap-3 mt-2">
        <Button
          variant="ghost"
          @click="emit('close')"
          :disabled="isDeleting"
        >
          Cancelar
        </Button>
        <Button
          class="bg-red-500! text-white! hover:bg-red-600!"
          @click="emit('confirm')"
          :disabled="isDeleting"
        >
          {{ isDeleting ? "Eliminando..." : "Sí, eliminar" }}
        </Button>
      </div>
    </div>
  </Modal>
</template>
