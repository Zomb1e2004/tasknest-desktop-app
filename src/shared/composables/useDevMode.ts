import { ref, watch } from "vue";

const KEY = "modeDev";

if (localStorage.getItem(KEY) === null) {
  localStorage.setItem(KEY, "0");
}

const isDevMode = ref(localStorage.getItem(KEY) === "1");

watch(isDevMode, (newVal) => {
  localStorage.setItem(KEY, newVal ? "1" : "0");
});

export function useDevMode() {
  const setDevMode = (value: boolean) => {
    isDevMode.value = value;
  };

  return {
    isDevMode,
    setDevMode,
  };
}
