<script setup lang="ts">
import { computed } from "vue";
import Modal from "./Modal.vue";
import Button from "./Button.vue";

const props = defineProps<{
  show: boolean;
  type: "success" | "error";
  title: string;
  message: string;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const iconData = computed(() => {
  return props.type === "success"
    ? { name: "check_circle", color: "text-[#4CAF50]", bg: "bg-[#4CAF50]/10" }
    : { name: "error", color: "text-[#D32F2F]", bg: "bg-[#D32F2F]/10" };
});
</script>

<template>
  <Modal v-if="show" @close="emit('close')">
    <div class="flex flex-col items-center gap-5 w-full text-center py-2">
      <div
        class="w-16 h-16 rounded-full flex items-center justify-center mb-1"
        :class="iconData.bg"
      >
        <span
          class="material-symbols-outlined text-[32px]"
          :class="iconData.color"
        >
          {{ iconData.name }}
        </span>
      </div>
      <div class="flex flex-col gap-2">
        <h3 class="text-xl font-bold text-black leading-tight">
          {{ title }}
        </h3>
        <p
          class="text-black/50 font-medium text-[15px] leading-relaxed max-w-[260px] mx-auto"
        >
          {{ message }}
        </p>
      </div>

      <div class="w-full mt-2.5">
        <Button fullWidth @click="emit('close')">Aceptar</Button>
      </div>
    </div>
  </Modal>
</template>
