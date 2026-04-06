<script setup lang="ts">
import { motion } from "motion-v";
</script>

<template>
  <motion.section
    id="page-container"
    class="px-6 py-6 sm:px-10 sm:py-10 w-full flex-1 min-h-0 flex flex-col bg-white text-black select-none overflow-y-auto"
    layout
    :initial="{ opacity: 0, y: 0 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.3, ease: 'easeOut' }"
  >
    <slot></slot>
  </motion.section>
</template>
