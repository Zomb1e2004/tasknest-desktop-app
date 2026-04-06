<script setup lang="ts">
import Modal from "../../../shared/components/Modal.vue";
import Button from "../../../shared/components/Button.vue";

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
          class="w-12 h-12 bg-[#D32F2F]/10 rounded-2xl flex items-center justify-center mb-1"
        >
          <span class="material-symbols-outlined text-[24px] text-[#D32F2F]">
            delete_forever
          </span>
        </div>
        <h3 class="text-xl font-bold text-black leading-tight">
          ¿Eliminar nota?
        </h3>
        <p class="text-black/60 font-medium text-[14px] leading-relaxed">
          Esta acción es
          <span class="font-bold text-black">permanente e irreversible</span>.
          La nota desaparecerá por completo de tu sistema.
        </p>
      </div>

      <div class="flex items-center justify-end gap-3 mt-2">
        <Button variant="ghost" @click="emit('close')">Cancelar</Button>
        <Button
          class="bg-[#D32F2F]! text-white! hover:bg-[#B71C1C]!"
          @click="emit('confirm')"
        >
          Sí, eliminar
        </Button>
      </div>
    </div>
  </Modal>
</template>
