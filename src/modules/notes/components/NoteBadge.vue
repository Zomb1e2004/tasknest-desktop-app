<script setup lang="ts">
import Badge from "../../../shared/components/Badge.vue";

interface Props {
  icon: string;
  value: string | number;
  label?: string;
}

defineProps<Props>();
</script>

<template>
  <Badge :icon="icon" :label="label">
    {{ value }}
  </Badge>
</template>
