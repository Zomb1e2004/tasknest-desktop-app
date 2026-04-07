<script setup lang="ts">
import { ref, onMounted } from "vue";
import DefaultLayout from "./layouts/DefaultLayout.vue";
import WelcomeModal from "./shared/components/WelcomeModal.vue";
import { getGreeting } from "./shared/utils/getGreeting";
import { useUser } from "./shared/composables/useUser";
import { AnimatePresence } from "motion-v";
import Toast from "./shared/components/Toast.vue";
import { useToast } from "./shared/composables/useToast";

const { userName, setUserName } = useUser();
const { addToast } = useToast();
const showWelcomeModal = ref(false);

onMounted(() => {
  window.addEventListener("keydown", (e) => {
    if (
      (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i") ||
      (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "c") ||
      (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "j")
    ) {
      e.preventDefault();
    }
  });

  if (!userName.value) {
    showWelcomeModal.value = true;
  } else {
    const welcomeShown = sessionStorage.getItem("welcome-shown");
    if (!welcomeShown) {
      addToast({
        title: `¡${getGreeting()}!`,
        message: `¡Hola de nuevo, ${userName.value}! Qué bueno verte por aquí.`,
        type: "success",
      });
      sessionStorage.setItem("welcome-shown", "true");
    }
  }
});

const saveName = (name: string) => {
  setUserName(name);
  showWelcomeModal.value = false;
};
</script>

<template>
  <DefaultLayout>
    <router-view :key="$route.fullPath" />
  </DefaultLayout>

  <AnimatePresence>
    <WelcomeModal v-if="showWelcomeModal" @save="saveName" />
  </AnimatePresence>
  <Toast />
</template>
