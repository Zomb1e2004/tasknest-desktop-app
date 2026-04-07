<script setup lang="ts">
defineProps<{
  show: boolean;
  top: number;
  left: number;
}>();

const emit = defineEmits<{
  (e: "tags"): void;
  (e: "delete"): void;
  (e: "close"): void;
}>();
</script>

<template>
  <transition
    enter-active-class="transition duration-150 ease-out"
    enter-from-class="scale-95 opacity-0"
    enter-to-class="scale-100 opacity-100"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="scale-100 opacity-100"
    leave-to-class="scale-95 opacity-0"
  >
    <div
      v-if="show"
      :style="{
        position: 'fixed',
        top: top + 'px',
        left: left + 'px',
        zIndex: 50,
      }"
      class="options-container w-40 bg-white border border-black/10 rounded-xl shadow-xl py-1.5 overflow-hidden"
    >
      <button
        @click.stop="emit('tags')"
        class="w-full cursor-pointer text-left px-4 py-2.5 text-sm font-semibold text-black/60 hover:text-black hover:bg-black/5 transition flex items-center gap-2"
      >
        <span class="material-symbols-outlined text-[16px]"> label </span>
        Etiquetas
      </button>

      <button
        @click.stop="emit('delete')"
        class="w-full cursor-pointer text-left px-4 py-2.5 text-sm font-semibold text-[#D32F2F]/80 hover:text-[#D32F2F] hover:bg-[#D32F2F]/10 transition flex items-center gap-2"
      >
        <span class="material-symbols-outlined text-[16px]"> delete </span>
        Eliminar
      </button>
    </div>
  </transition>
</template>
