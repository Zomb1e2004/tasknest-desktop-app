<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const isVisible = ref(false);
let container: HTMLElement | null = null;

const handleScroll = () => {
  if (!container) return;
  const scrollPosition = container.scrollTop + container.clientHeight;
  const totalHeight = container.scrollHeight;
  isVisible.value =
    totalHeight - scrollPosition > 100 && container.scrollTop < 100;
};

const scrollDown = () => {
  container?.scrollBy({
    top: container.clientHeight * 0.8,
    behavior: "smooth",
  });
};

onMounted(() => {
  container = document.getElementById("page-container");
  container?.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", handleScroll, { passive: true });
  setTimeout(handleScroll, 500);
});

onUnmounted(() => {
  container?.removeEventListener("scroll", handleScroll);
  window.removeEventListener("resize", handleScroll);
});
</script>

<template>
  <transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-6 scale-90"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 translate-y-6 scale-90"
  >
    <div
      v-if="isVisible"
      @click="scrollDown"
      aria-label="Deslizar hacia abajo"
      title="Más contenido"
      class="fixed cursor-pointer bottom-10 right-10 z-50 w-12 h-12 flex items-center justify-center rounded-3xl bg-neutral-900/85 text-white shadow-lg shadow-black/20 backdrop-blur-md transition-all duration-200 hover:bg-neutral-900 hover:-translate-y-1 hover:shadow-xl active:translate-y-0 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2"
    >
      <span class="material-symbols-outlined text-[22px] animate-bounce">
        arrow_downward
      </span>
    </div>
  </transition>
</template>

<style scoped>
.animate-bounce {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(4px);
  }
  60% {
    transform: translateY(2px);
  }
}
</style>
