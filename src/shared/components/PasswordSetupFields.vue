<script setup lang="ts">
import { ref, computed } from "vue";
import { MIN_PASSWORD_LENGTH } from "../composables/useSecurity";

const password = defineModel<string>("password", { default: "" });
const confirm = defineModel<string>("confirm", { default: "" });

const showPassword = ref(false);
const showConfirm = ref(false);

const isLongEnough = computed(() => password.value.length >= MIN_PASSWORD_LENGTH);
const doMatch = computed(
  () => confirm.value.length > 0 && password.value === confirm.value,
);
const doMismatch = computed(
  () => confirm.value.length > 0 && password.value !== confirm.value,
);

const inputClass =
  "w-full bg-black/5 dark:bg-white/10 focus:bg-black/10 dark:focus:bg-white/10 text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 rounded-xl py-3.5 px-4 pr-12 outline-none border border-black/10 dark:border-white/10 focus:border-black/20 dark:focus:border-white/20 transition-all text-sm font-medium font-['Manrope']";
</script>

<template>
  <div class="w-full flex flex-col gap-3 text-left">
    <div class="relative">
      <input
        v-model="password"
        :type="showPassword ? 'text' : 'password'"
        :placeholder="`Contraseña (mín. ${MIN_PASSWORD_LENGTH} caracteres)`"
        autocomplete="new-password"
        :class="inputClass"
      />
      <button
        type="button"
        @click="showPassword = !showPassword"
        :title="showPassword ? 'Ocultar' : 'Mostrar'"
        class="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-lg text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-all"
      >
        <span class="material-symbols-outlined text-[20px]">
          {{ showPassword ? "visibility_off" : "visibility" }}
        </span>
      </button>
    </div>

    <div class="relative">
      <input
        v-model="confirm"
        :type="showConfirm ? 'text' : 'password'"
        placeholder="Confirma tu contraseña"
        autocomplete="new-password"
        :class="inputClass"
      />
      <button
        type="button"
        @click="showConfirm = !showConfirm"
        :title="showConfirm ? 'Ocultar' : 'Mostrar'"
        class="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-lg text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-all"
      >
        <span class="material-symbols-outlined text-[20px]">
          {{ showConfirm ? "visibility_off" : "visibility" }}
        </span>
      </button>
    </div>

    <div class="flex flex-col gap-1.5 px-1">
      <p
        class="flex items-center gap-1.5 text-[12px] font-bold"
        :class="isLongEnough ? 'text-green-600 dark:text-green-400' : 'text-black/40 dark:text-white/40'"
      >
        <span class="material-symbols-outlined text-[16px]">
          {{ isLongEnough ? "check_circle" : "radio_button_unchecked" }}
        </span>
        Mínimo {{ MIN_PASSWORD_LENGTH }} caracteres
      </p>
      <p
        v-if="doMatch"
        class="flex items-center gap-1.5 text-[12px] font-bold text-green-600 dark:text-green-400"
      >
        <span class="material-symbols-outlined text-[16px]">check_circle</span>
        Las contraseñas coinciden
      </p>
      <p
        v-if="doMismatch"
        class="flex items-center gap-1.5 text-[12px] font-bold text-red-500"
      >
        <span class="material-symbols-outlined text-[16px]">error</span>
        Las contraseñas no coinciden
      </p>
    </div>
  </div>
</template>
