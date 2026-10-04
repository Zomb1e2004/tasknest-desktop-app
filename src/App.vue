<script setup lang="ts">
import { ref, onMounted } from "vue";
import DefaultLayout from "./layouts/DefaultLayout.vue";
import WelcomeModal from "./shared/components/WelcomeModal.vue";
import { getGreeting } from "./shared/utils/getGreeting";
import { useUser } from "./shared/composables/useUser";
import { useTheme } from "./shared/composables/useTheme";
import { useSecurity } from "./shared/composables/useSecurity";
import SecureLockModal from "./shared/components/SecureLockModal.vue";
import { AnimatePresence } from "motion-v";
import Toast from "./shared/components/Toast.vue";
import { useToast } from "./shared/composables/useToast";

const { userName, setUserName } = useUser();
const { initTheme } = useTheme();
const { addToast } = useToast();
const { secureEnabled, hasPassword, setPassword, isUnlocked, markUnlocked } =
  useSecurity();
const showWelcomeModal = ref(false);
const showLock = ref(false);

const showWelcomeBack = () => {
  const welcomeShown = sessionStorage.getItem("welcome-shown");
  if (!welcomeShown) {
    addToast({
      title: `¡${getGreeting()}!`,
      message: `¡Hola de nuevo, ${userName.value}! Qué bueno verte por aquí.`,
      type: "success",
    });
    sessionStorage.setItem("welcome-shown", "true");
  }
};

onMounted(() => {
  initTheme();
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
  } else if (secureEnabled.value && hasPassword() && !isUnlocked()) {
    showLock.value = true;
  } else {
    showWelcomeBack();
  }
});

const saveName = async (payload: { name: string; password: string }) => {
  setUserName(payload.name);
  await setPassword(payload.password);
  markUnlocked();
  showWelcomeModal.value = false;
  showWelcomeBack();
};

const handleUnlock = () => {
  showLock.value = false;
  showWelcomeBack();
};
</script>

<template>
  <SecureLockModal v-if="showLock" @unlock="handleUnlock" />

  <template v-else>
    <DefaultLayout>
      <router-view :key="$route.fullPath" />
    </DefaultLayout>

    <AnimatePresence>
      <WelcomeModal v-if="showWelcomeModal" @save="saveName" />
    </AnimatePresence>
  </template>
  <Toast />
</template>
