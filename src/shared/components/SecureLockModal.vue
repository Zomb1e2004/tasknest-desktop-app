<script setup lang="ts">
import { ref } from "vue";
import { motion } from "motion-v";
import Button from "./Button.vue";
import { useSecurity } from "../composables/useSecurity";

const emit = defineEmits<{
  (e: "unlock"): void;
}>();

const { verifyPassword, markUnlocked } = useSecurity();

const input = ref("");
const error = ref("");
const checking = ref(false);
const showPassword = ref(false);

const handleUnlock = async () => {
  if (!input.value || checking.value) return;
  checking.value = true;
  error.value = "";
  try {
    if (await verifyPassword(input.value)) {
      markUnlocked();
      emit("unlock");
    } else {
      error.value = "Contraseña incorrecta. Inténtalo de nuevo.";
    }
  } finally {
    checking.value = false;
  }
};
</script>

<template>
  <motion.div
    class="fixed inset-0 z-[9998] flex items-center justify-center bg-neutral-950 p-6 select-none"
    :initial="{ opacity: 0 }"
    :animate="{ opacity: 1 }"
    :transition="{ duration: 0.3 }"
  >
    <motion.div
      class="w-full max-w-sm bg-white dark:bg-neutral-900 border border-black dark:border-white/15 p-10 rounded-2xl shadow-2xl font-['Manrope']"
      :initial="{ opacity: 0, scale: 0.95, y: 20 }"
      :animate="{ opacity: 1, scale: 1, y: 0 }"
      :transition="{ duration: 0.3, ease: 'easeInOut' }"
    >
      <div class="flex flex-col items-center gap-6 text-center">
        <div
          class="w-16 h-16 bg-black/5 dark:bg-white/10 rounded-2xl flex items-center justify-center"
        >
          <span class="material-symbols-outlined text-4xl text-black/60 dark:text-white/70">
            lock
          </span>
        </div>

        <div class="flex flex-col gap-2">
          <h2 class="text-2xl font-bold text-black dark:text-white">
            Inicio seguro
          </h2>
          <p class="text-sm text-black/60 dark:text-white/60 font-medium leading-relaxed">
            Ingresa tu contraseña para acceder a TaskNest.
          </p>
        </div>

        <div class="w-full flex flex-col gap-4">
          <div class="relative">
            <input
              v-model="input"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Tu contraseña"
              autocomplete="current-password"
              class="w-full bg-black/5 dark:bg-white/10 focus:bg-black/10 dark:focus:bg-white/10 text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 rounded-xl py-4 px-4 pr-12 outline-none border transition-all text-sm font-medium"
              :class="error ? 'border-red-500' : 'border-black/10 dark:border-white/10 focus:border-black/20 dark:focus:border-white/20'"
              @keyup.enter="handleUnlock"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-lg text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-all"
            >
              <span class="material-symbols-outlined text-[20px]">
                {{ showPassword ? "visibility_off" : "visibility" }}
              </span>
            </button>
          </div>

          <p v-if="error" class="text-[13px] font-bold text-red-500">
            {{ error }}
          </p>

          <Button fullWidth :disabled="!input || checking" @click="handleUnlock">
            {{ checking ? "Verificando..." : "Desbloquear" }}
          </Button>
        </div>
      </div>
    </motion.div>
  </motion.div>
</template>
