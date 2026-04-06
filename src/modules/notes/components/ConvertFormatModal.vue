<script setup lang="ts">
import Modal from "../../../shared/components/Modal.vue";
import Button from "../../../shared/components/Button.vue";

const props = defineProps<{
  show: boolean;
  targetFormat: "md" | "txt";
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "confirm"): void;
}>();
</script>

<template>
  <Modal v-if="show" @close="$emit('close')">
    <div class="flex flex-col gap-6 text-center">
      <div class="flex flex-col gap-3">
        <div
          class="w-14 h-14 bg-black/5 rounded-2xl flex items-center justify-center mx-auto mb-2"
        >
          <span class="material-symbols-outlined text-[32px] text-black/60">
            {{ targetFormat === "md" ? "markdown" : "description" }}
          </span>
        </div>

        <h3 class="text-xl font-bold tracking-tight">
          Convertir a {{ targetFormat.toUpperCase() }}
        </h3>

        <p class="text-sm text-black/50 leading-relaxed px-4">
          <template v-if="targetFormat === 'md'">
            Se habilitará la previsualización de Markdown y el soporte para
            formato enriquecido en esta nota.
          </template>
          <template v-else>
            Se desactivará la previsualización de Markdown. El contenido se
            tratará como texto plano sin formato visual.
          </template>
          ¿Estás seguro de que deseas continuar con la conversión?
        </p>
      </div>

      <div class="flex gap-3">
        <Button
          variant="secondary"
          class="flex-1"
          @click="$emit('close')"
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          class="flex-1"
          @click="$emit('confirm')"
        >
          Confirmar
        </Button>
      </div>
    </div>
  </Modal>
</template>
