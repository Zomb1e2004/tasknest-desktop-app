<script setup lang="ts">
import { ref, computed } from "vue";
import { useUser } from "../composables/useUser";
import { getGreeting } from "../utils/getGreeting";
import { MIN_PASSWORD_LENGTH } from "../composables/useSecurity";
import Modal from "./Modal.vue";
import Button from "./Button.vue";
import PasswordSetupFields from "./PasswordSetupFields.vue";

const emit = defineEmits<{
  (e: "save", payload: { name: string; password: string }): void;
}>();

const { setRegisteredAt } = useUser();
const inputName = ref("");
const inputPassword = ref("");
const inputConfirm = ref("");

const canSave = computed(
  () =>
    inputName.value.trim().length > 0 &&
    inputPassword.value.length >= MIN_PASSWORD_LENGTH &&
    inputPassword.value === inputConfirm.value,
);

const handleSave = () => {
  if (canSave.value) {
    setRegisteredAt(new Date().toISOString());
    emit("save", { name: inputName.value.trim(), password: inputPassword.value });
  }
};
</script>

<template>
  <Modal :close-on-click-outside="false" :show-close-button="false">
    <div class="flex flex-col items-center gap-6 text-center">
      <div
        class="w-16 h-16 bg-black/5 dark:bg-white/10 rounded-2xl flex items-center justify-center"
      >
        <span class="material-symbols-outlined text-4xl text-black/40 dark:text-white/60"
          >waving_hand</span
        >
      </div>

      <div class="flex flex-col gap-2">
        <h2 class="text-2xl font-bold text-black dark:text-white font-['Manrope']">
          {{ getGreeting() }}!
        </h2>
        <p
          class="text-sm text-black/70 dark:text-white/70 font-['Manrope'] leading-relaxed max-w-[280px]"
        >
          ¡Qué alegría verte por aquí! Para empezar, dinos cómo te gustaría que
          te llamáramos y crea tu contraseña de acceso.
        </p>
      </div>

      <div class="w-full flex flex-col gap-4">
        <input
          v-model="inputName"
          type="text"
          class="w-full bg-black/5 dark:bg-white/10 focus:bg-black/10 dark:focus:bg-white/10 text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 rounded-xl py-4 px-4 outline-none border border-black/10 dark:border-white/10 focus:border-black/20 dark:focus:border-white/20 transition-all text-sm font-medium font-['Manrope']"
          placeholder="Tu nombre o apodo..."
        />
        <PasswordSetupFields
          v-model:password="inputPassword"
          v-model:confirm="inputConfirm"
        />
        <Button @click="handleSave" fullWidth :disabled="!canSave">Comenzar ahora</Button>
      </div>
    </div>
  </Modal>
</template>
