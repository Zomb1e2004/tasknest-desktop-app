<script setup lang="ts" generic="T extends { id: string | number }">
import { motion } from "motion-v";

defineProps<{
  items: T[];
  isGridView: boolean;
  cols?: string;
}>();
</script>

<template>
  <div class="flex flex-col w-full font-['Manrope']">
    <motion.div
      v-if="items.length > 0"
      layout
      :class="[
        'gap-3.5 grid',
        isGridView
          ? cols || 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
          : 'grid-cols-1',
      ]"
    >
      <slot name="action-card" />

      <template v-for="(item, index) in items" :key="item.id">
        <slot name="item" :item="item" :index="index" />
      </template>
    </motion.div>

    <div v-else class="flex flex-col gap-8">
      <slot name="action-card" />
      <slot name="empty-state" />
    </div>
  </div>
</template>
