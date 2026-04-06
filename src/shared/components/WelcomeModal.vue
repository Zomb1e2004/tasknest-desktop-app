<script setup lang="ts">
import { ref } from "vue";
import Modal from "./Modal.vue";
import Button from "./Button.vue";
import { getGreeting } from "../utils/getGreeting";

const emit = defineEmits<{
  (e: "save", name: string): void;
}>();

const inputName = ref("");

const handleSave = () => {
  if (inputName.value.trim()) {
    emit("save", inputName.value.trim());
  }
};
</script>

<template>
  <Modal :close-on-click-outside="false" :show-close-button="false">
    <div class="flex flex-col items-center gap-6 text-center">
      <div
        class="w-16 h-16 bg-black/5 rounded-2xl flex items-center justify-center"
      >
        <span class="material-symbols-outlined text-4xl text-black/40"
          >waving_hand</span
        >
      </div>

      <div class="flex flex-col gap-2">
        <h2 class="text-2xl font-bold text-black font-['Manrope']">
          {{ getGreeting() }}!
        </h2>
        <p
          class="text-sm text-black/70 font-['Manrope'] leading-relaxed max-w-[280px]"
        >
          ¡Qué alegría verte por aquí! Para empezar, dinos cómo te gustaría que
          te llamáramos.
        </p>
      </div>

      <div class="w-full flex flex-col gap-6">
        <input
          v-model="inputName"
          type="text"
          class="w-full bg-black/5 focus:bg-black/10 text-black placeholder-black/40 rounded-xl py-4 px-4 outline-none border border-black/10 focus:border-black/20 transition-all text-sm font-medium font-['Manrope']"
          placeholder="Tu nombre o apodo..."
          @keyup.enter="handleSave"
        />
        <Button @click="handleSave" fullWidth>Comenzar ahora</Button>
      </div>
    </div>
  </Modal>
</template>
