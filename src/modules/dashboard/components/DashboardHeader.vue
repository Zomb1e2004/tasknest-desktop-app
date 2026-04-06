<script setup lang="ts">
defineProps<{
  actualDate: string;
  actualGreeting: string;
  userName: string;
}>();
</script>

<template>
  <section class="flex flex-col gap-2">
    <span class="text-xs font-bold tracking-[0.2em] text-secondary uppercase">{{
      $props.actualDate
    }}</span>
    <h2
      class="text-2xl md:text-4xl font-headline font-bold tracking-tight text-on-surface"
    >
      {{ $props.actualGreeting }}, {{ $props.userName ?? "Desconocid@" }} :)
    </h2>
  </section>
</template>
