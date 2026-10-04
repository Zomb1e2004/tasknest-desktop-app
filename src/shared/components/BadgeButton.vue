<script setup lang="ts">
import Badge from "./Badge.vue";

defineProps<{
  icon?: string;
  label?: string;
}>();

defineEmits<{
  (e: "click"): void;
}>();
</script>

<template>
  <Badge
    :icon="icon"
    :label="label"
    class="cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 hover:border-black/20 dark:hover:border-white/20 transition-all select-none"
    @click="$emit('click')"
  >
    <slot />
  </Badge>
</template>
