<script setup lang="ts">
interface Props {
  icon?: string;
  variant?: "primary" | "secondary" | "ghost";
  fullWidth?: boolean;
  disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
  variant: "primary",
  fullWidth: false,
  disabled: false,
});
</script>

<template>
  <button
    :disabled="disabled"
    :class="[
      'group relative flex items-center justify-center h-full gap-2 px-5 py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-300 ease-out',
      disabled
        ? 'cursor-not-allowed opacity-40 grayscale'
        : 'cursor-pointer active:scale-95',
      fullWidth ? 'w-full' : '',
      variant === 'primary' && !disabled
        ? 'bg-black text-white shadow hover:shadow-md hover:-translate-y-[2px] hover:bg-black/90 active:shadow-sm active:translate-y-0'
        : '',
      variant === 'primary' && disabled
        ? 'bg-transparent text-black/40 border border-black/10'
        : '',
      variant === 'secondary' && !disabled
        ? 'bg-white text-black border border-black hover:bg-black/5 hover:-translate-y-[2px] active:translate-y-0'
        : '',
      variant === 'secondary' && disabled
        ? 'bg-white text-black/20 border border-black/5'
        : '',
      variant === 'ghost'
        ? 'bg-transparent text-black hover:bg-black/10 hover:scale-105 active:scale-95'
        : '',
    ]"
  >
    <span
      v-if="icon"
      class="material-symbols-outlined text-[18px] transition-transform duration-300 group-hover:rotate-90 group-active:scale-75"
      :data-icon="icon"
    >
      {{ icon }}
    </span>
    <span><slot /></span>
  </button>
</template>
