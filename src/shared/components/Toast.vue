<script setup lang="ts">
import { computed } from "vue";
import { motion, AnimatePresence } from "motion-v";
import { useToast } from "../composables/useToast";

const { toasts, removeToast } = useToast();

const groupedToasts = computed(() => {
  const groups: Record<string, any[]> = {};

  toasts.value.forEach((toast) => {
    const key = `${toast.vertical || "top"}-${toast.horizontal || "right"}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(toast);
  });

  return groups;
});

const getPositionClasses = (v: string, h: string) => {
  const vertical = v === "top" ? "top-6" : "bottom-6";
  const horizontal = h === "left" ? "left-6 text-left" : "right-6 text-right";
  const flexDir = "flex-col-reverse";

  return `fixed ${vertical} ${horizontal} z-[9999] flex ${flexDir} gap-3 pointer-events-none`;
};

const getIcon = (toast: any) => {
  if (toast.icon) return toast.icon;
  switch (toast.type) {
    case "success":
      return "check_circle";
    case "error":
      return "error";
    case "warning":
      return "warning";
    default:
      return "info";
  }
};

const getAnimation = (h: string) => ({
  initial: {
    opacity: 0,
    x: h === "left" ? -100 : 100,
    scale: 0.8,
    filter: "blur(4px)",
  },
  animate: { opacity: 1, x: 0, scale: 1, filter: "blur(0px)" },
  exit: {
    opacity: 0,
    x: h === "left" ? -100 : 100,
    scale: 0.8,
    filter: "blur(4px)",
  },
  transition: { type: "spring" as const, stiffness: 260, damping: 20 },
});
</script>

<template>
  <template v-for="v in ['top', 'bottom'] as const" :key="v">
    <template v-for="h in ['left', 'right'] as const" :key="h">
      <div :class="getPositionClasses(v, h)">
        <AnimatePresence>
          <motion.div
            v-for="toast in groupedToasts[`${v}-${h}`] || []"
            :key="toast.id"
            v-bind="getAnimation(toast.horizontal || 'right')"
            class="pointer-events-auto min-w-[320px] max-w-[400px] flex items-stretch bg-white dark:bg-neutral-900 border-2 border-black dark:border-white/20 rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)] overflow-hidden font-['Manrope'] select-none relative"
          >
            <div
              v-if="toast.showIcon !== false"
              class="shrink-0 w-14 flex items-center justify-center border-r-2 border-black/5 dark:border-white/10 bg-black/2 dark:bg-white/10"
            >
              <span class="material-symbols-outlined text-[24px] text-black dark:text-white">
                {{ getIcon(toast) }}
              </span>
            </div>

            <div class="grow flex flex-col justify-center py-4 px-4 gap-0.5">
              <h4
                v-if="toast.title"
                class="font-black text-[15px] text-black dark:text-white uppercase tracking-tight leading-none mb-1"
              >
                {{ toast.title }}
              </h4>
              <p class="text-[13px] text-black/70 dark:text-white/70 font-semibold leading-snug">
                {{ toast.message }}
              </p>
            </div>

            <div class="shrink-0 flex items-start p-2">
              <button
                @click="removeToast(toast.id!)"
                class="w-8 h-8 flex items-center justify-center rounded-lg text-black/20 dark:text-white/40 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer"
              >
                <span class="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </template>
  </template>
</template>
