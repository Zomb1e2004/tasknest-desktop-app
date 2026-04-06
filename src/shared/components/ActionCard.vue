<script setup lang="ts">
withDefaults(
  defineProps<{
    icon: string;
    text: string;
    variant?: "light" | "dark";
  }>(),
  {
    variant: "light",
  },
);
</script>

<template>
  <button
    class="border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer group transition-all outline-none"
    :class="
      variant === 'dark'
        ? 'bg-black border-black hover:bg-black/90 hover:shadow-xl hover:shadow-black/10'
        : 'bg-black/5 border-black/10 hover:bg-black/10 hover:border-black/20 hover:shadow-sm'
    "
  >
    <div
      class="w-16 h-16 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 group-active:scale-95 transition-all"
      :class="
        variant === 'dark'
          ? 'bg-white/15 group-hover:bg-white/25'
          : 'bg-white/60 group-hover:bg-white'
      "
    >
      <span
        class="material-symbols-outlined text-[36px] transition-colors"
        :class="
          variant === 'dark'
            ? 'text-white/90 group-hover:text-white'
            : 'text-black/40 group-hover:text-black/80'
        "
        >{{ icon }}</span
      >
    </div>
    <span
      class="font-bold tracking-tight transition-colors"
      :class="
        variant === 'dark'
          ? 'text-white/80 group-hover:text-white'
          : 'text-black/50 group-hover:text-black/90'
      "
      >{{ text }}</span
    >
  </button>
</template>
