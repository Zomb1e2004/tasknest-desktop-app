import { ref, watch } from "vue";

export type Theme = "light" | "dark";

const THEME_KEY = "tasknest-theme";

function getInitialTheme(): Theme {
  const saved = localStorage.getItem(THEME_KEY) as Theme | null;
  if (saved === "light" || saved === "dark") return saved;
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }
  return "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

const theme = ref<Theme>(
  typeof window !== "undefined"
    ? (localStorage.getItem(THEME_KEY) as Theme) === "dark" ||
      (!(localStorage.getItem(THEME_KEY) === "light") &&
        window.matchMedia?.("(prefers-color-scheme: dark)").matches)
      ? "dark"
      : "light"
    : "light"
);

if (typeof window !== "undefined") {
  applyTheme(theme.value);
}

watch(theme, (newVal) => {
  localStorage.setItem(THEME_KEY, newVal);
  applyTheme(newVal);
});

export function useTheme() {
  const setTheme = (value: Theme) => {
    theme.value = value;
  };

  const toggleTheme = () => {
    theme.value = theme.value === "dark" ? "light" : "dark";
  };

  const initTheme = () => {
    theme.value = getInitialTheme();
    applyTheme(theme.value);
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    initTheme,
  };
}
