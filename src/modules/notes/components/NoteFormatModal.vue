<script setup lang="ts">
import Modal from "../../../shared/components/Modal.vue";
import Button from "../../../shared/components/Button.vue";

defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "select", format: "md" | "txt"): void;
}>();
</script>

<template>
  <Modal v-if="show" @close="emit('close')">
    <div class="flex flex-col gap-6 text-center">
      <div class="flex flex-col gap-2">
        <h2 class="text-xl font-bold text-black font-['Manrope']">
          Selecciona el formato
        </h2>
        <p class="text-sm text-black/60 font-['Manrope']">
          ¿En qué formato deseas crear tu nota?
        </p>
      </div>

      <div class="flex flex-col gap-4">
        <Button variant="secondary" @click="emit('select', 'md')" fullWidth>
          <div class="flex flex-col items-center gap-3 py-4">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-2xl">markdown</span>
              <span class="font-bold">Markdown (MD)</span>
            </div>
            <p class="text-[11px] text-black/45 leading-relaxed px-6">
              Para un estilo profesional con formato enriquecido y estructurado.
            </p>
          </div>
        </Button>

        <Button variant="secondary" @click="emit('select', 'txt')" fullWidth>
          <div class="flex flex-col items-center gap-3 py-4">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-2xl"
                >description</span
              >
              <span class="font-bold text-black/80">Texto Plano (TXT)</span>
            </div>
            <p class="text-[11px] text-black/45 leading-relaxed px-6">
              Ideal para notas rápidas, sencillas y sin distracciones.
            </p>
          </div>
        </Button>
      </div>
    </div>
  </Modal>
</template>
