<script setup lang="ts">
import Button from "./Button.vue";
import { motion } from "motion-v";

interface Props {
  saveLabel?: string;
  cancelLabel?: string;
  saveIcon?: string;
  cancelIcon?: string;
  isSaving?: boolean;
  saveDisabled?: boolean;
}

withDefaults(defineProps<Props>(), {
  saveLabel: "Guardar",
  cancelLabel: "Cancelar",
  isSaving: false,
  saveDisabled: false,
});

defineEmits<{
  (e: "save"): void;
  (e: "cancel"): void;
}>();
</script>

<template>
  <motion.footer
    class="h-20 sm:h-24 px-4 sm:px-8 md:px-12 flex items-center justify-end bg-white/55 backdrop-blur-md border-t border-black/10 sticky bottom-0 z-50 w-full font-['Manrope'] select-none gap-4"
    :style="{ boxShadow: '0 -4px 60px -15px rgba(0, 0, 0, 0.05)' }"
    layout
    :initial="{ opacity: 0, y: 0 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.3, ease: 'easeOut' }"
  >
    <div class="flex-1">
      <slot name="left" />
    </div>

    <div class="flex items-center gap-3">
      <Button
        variant="secondary"
        @click="$emit('cancel')"
        :icon="cancelIcon"
        type="button"
      >
        {{ cancelLabel }}
      </Button>

      <Button
        variant="primary"
        @click="$emit('save')"
        :icon="saveIcon"
        :disabled="isSaving || saveDisabled"
        type="submit"
      >
        <span v-if="!isSaving">{{ saveLabel }}</span>
        <span v-else class="flex items-center gap-2">
          <span
            class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
          ></span>
          Procesando...
        </span>
      </Button>
    </div>
  </motion.footer>
</template>
