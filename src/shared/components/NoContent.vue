<script setup lang="ts">
import { motion } from "motion-v";

withDefaults(
  defineProps<{
    icon?: string;
    title: string;
    description: string;
  }>(),
  {
    icon: "done_all",
  },
);
</script>

<template>
  <motion.div
    :initial="{ opacity: 0 }"
    :animate="{ opacity: 1 }"
    :transition="{ duration: 0.4, ease: 'easeOut' }"
    class="flex flex-col items-center justify-center py-6 gap-3 text-center"
  >
    <div
      class="w-[60px] h-[60px] rounded-2xl bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10 flex items-center justify-center mb-2"
    >
      <span class="material-symbols-outlined text-[32px] text-black/30 dark:text-white/40">
        {{ icon }}
      </span>
    </div>
    <div>
      <h3 class="text-[16px] font-bold text-black/80 dark:text-white/80 mb-1">{{ title }}</h3>
      <p
        class="text-[13px] font-medium text-black/40 dark:text-white/60 max-w-[220px] leading-relaxed mx-auto"
      >
        {{ description }}
      </p>
    </div>
  </motion.div>
</template>
