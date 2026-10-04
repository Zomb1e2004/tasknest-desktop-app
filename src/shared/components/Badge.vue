<script setup lang="ts">
interface Props {
  icon?: string;
  label?: string;
}

defineProps<Props>();
</script>

<template>
  <div
    class="flex items-center gap-1.5 bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 rounded-full px-3 py-1 transition-colors duration-200"
  >
    <span
      v-if="icon"
      class="material-symbols-outlined text-[12px] text-black/40 dark:text-white/60"
    >
      {{ icon }}
    </span>

    <span
      class="text-[11px] font-bold text-black/60 dark:text-white/60 font-['Manrope'] tabular-nums"
    >
      <slot />
    </span>

    <span v-if="label" class="text-[11px] text-black/40 dark:text-white/60 font-['Manrope']">
      {{ label }}
    </span>
  </div>
</template>
