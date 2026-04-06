<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { motion } from "motion-v";

const props = withDefaults(
  defineProps<{
    showCloseButton?: boolean;
    closeOnClickOutside?: boolean;
  }>(),
  {
    showCloseButton: true,
    closeOnClickOutside: true,
  },
);

const emit = defineEmits<{
  (e: "close"): void;
}>();

const handleOutsideClick = () => {
  if (props.closeOnClickOutside) {
    emit("close");
  }
};

onMounted(() => {
  document.body.style.overflow = "hidden";
});

onUnmounted(() => {
  document.body.style.overflow = "";
});
</script>

<template>
  <motion.div
    class="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-[7px] select-none"
    @click.self="handleOutsideClick"
    :initial="{ opacity: 0 }"
    :animate="{ opacity: 1 }"
    :exit="{ opacity: 0 }"
    :transition="{ duration: 0.3, ease: 'easeOut' }"
  >
    <motion.div
      class="relative w-full max-w-md bg-white border border-black p-10 rounded-2xl shadow-2xl font-['Manrope'] text-black"
      :initial="{ opacity: 0, scale: 0.95, y: 20 }"
      :animate="{ opacity: 1, scale: 1, y: 0 }"
      :exit="{ opacity: 0, scale: 0.95, y: 20 }"
      :transition="{ duration: 0.3, ease: 'easeInOut' }"
    >
      <button
        v-if="showCloseButton"
        @click="$emit('close')"
        class="absolute top-4 right-4 text-black/40 hover:text-black transition-colors"
      >
        <span class="material-symbols-outlined text-[20px] cursor-pointer">close</span>
      </button>

      <slot></slot>
    </motion.div>
  </motion.div>
</template>
