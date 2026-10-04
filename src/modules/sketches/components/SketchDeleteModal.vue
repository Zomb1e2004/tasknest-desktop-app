<script setup lang="ts">
import Modal from "../../../shared/components/Modal.vue";
import Button from "../../../shared/components/Button.vue";

defineProps<{
  title: string;
}>();

defineEmits<{
  (e: "confirm"): void;
  (e: "close"): void;
}>();
</script>

<template>
  <Modal @close="$emit('close')">
    <div class="flex flex-col gap-6 w-full text-left">
      <div class="flex flex-col gap-2">
        <div
          class="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mb-1"
        >
          <span class="material-symbols-outlined text-[24px] text-red-500">
            delete
          </span>
        </div>
        <h3 class="text-xl font-bold text-black dark:text-white leading-tight">
          ¿Eliminar trazo?
        </h3>
        <p class="text-black/60 dark:text-white/60 font-medium text-[14px] leading-relaxed">
          Se eliminará <span class="font-bold">“{{ title }}”</span> de forma
          permanente. Esta acción no se puede deshacer.
        </p>
      </div>

      <div class="flex items-center justify-end gap-3">
        <Button variant="ghost" @click="$emit('close')">Cancelar</Button>
        <Button variant="custom" class="bg-red-500! text-white! hover:bg-red-600! px-6" @click="$emit('confirm')">
          Eliminar
        </Button>
      </div>
    </div>
  </Modal>
</template>
