<script setup lang="ts">
import Modal from "../../../shared/components/Modal.vue";
import Button from "../../../shared/components/Button.vue";

defineProps<{
  modelValue: string;
  isSaving: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "confirm"): void;
  (e: "close"): void;
}>();
</script>

<template>
  <Modal @close="emit('close')" :close-on-click-outside="true">
    <div class="flex flex-col gap-6 w-full text-left font-['Manrope']">
      <div class="flex flex-col gap-2">
        <div
          class="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center mb-1"
        >
          <span class="material-symbols-outlined text-[24px] text-black">
            label
          </span>
        </div>
        <h3 class="text-xl font-bold text-black leading-tight">
          Nueva etiqueta
        </h3>
        <p class="text-black/60 font-medium text-[14px] leading-relaxed">
          Ingresa un nombre para la nueva etiqueta. Las etiquetas te ayudan a
          organizar mejor tus notas.
        </p>
      </div>

      <div class="flex flex-col gap-2">
        <input
          :value="modelValue"
          @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="Nombre de la etiqueta..."
          class="w-full px-4 py-3 bg-black/5 border border-black/10 rounded-xl text-sm font-bold text-black placeholder:text-black/30 focus:outline-hidden focus:border-black/20 transition-all"
          @keyup.enter="emit('confirm')"
          autofocus
        />
      </div>

      <div class="flex items-center justify-end gap-3 mt-2">
        <Button variant="ghost" @click="emit('close')"> Cancelar </Button>
        <Button
          @click="emit('confirm')"
          :disabled="!modelValue.trim() || isSaving"
        >
          {{ isSaving ? "Guardando..." : "Crear etiqueta" }}
        </Button>
      </div>
    </div>
  </Modal>
</template>
