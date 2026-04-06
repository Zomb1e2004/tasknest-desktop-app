<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { motion, AnimatePresence } from "motion-v";

const noteTitle = defineModel<string>({ required: true });

const sampleTitles = [
  "Ideas de aplicaciones",
  "Mis quehaceres",
  "Libros por comprar",
  "gdsujikdsghsmiaudksdghshu",
  "Gato tonto, aléjate del teclado",
  "Título de nota...",
];

const currentTitleIndex = ref(0);
const isFocused = ref(false);
let rotationInterval: any = null;

onMounted(() => {
  rotationInterval = setInterval(() => {
    currentTitleIndex.value =
      (currentTitleIndex.value + 1) % sampleTitles.length;
  }, 2500);
});

onUnmounted(() => {
  if (rotationInterval) clearInterval(rotationInterval);
});
</script>

<template>
  <section class="flex flex-col gap-6 select-none mx-auto w-full">
    <div class="flex flex-col gap-6">
      <hr class="border-t-2 border-black/5" />

      <div class="relative group">
        <div class="absolute inset-0 pointer-events-none flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              v-if="!isFocused && !noteTitle"
              :key="currentTitleIndex"
              :initial="{ opacity: 0, y: 10, filter: 'blur(4px)' }"
              :animate="{ opacity: 1, y: 0, filter: 'blur(0px)' }"
              :exit="{ opacity: 0, y: -10, filter: 'blur(4px)' }"
              :transition="{ duration: 0.5, ease: 'easeInOut' }"
              class="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter text-black/10 leading-none font-['Manrope'] truncate w-full"
            >
              {{ sampleTitles[currentTitleIndex] }}
            </motion.div>
          </AnimatePresence>
        </div>

        <h2
          class="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter text-black/90 leading-none relative z-10"
        >
          <input
            v-model="noteTitle"
            type="text"
            id="newNoteTitle"
            @focus="isFocused = true"
            @blur="isFocused = false"
            autocomplete="off"
            class="w-full bg-transparent outline-none border-none transition-all font-['Manrope']"
          />
        </h2>
      </div>

      <hr class="border-t-2 border-black/5" />
    </div>
  </section>
</template>
