<script setup lang="ts">
import { computed } from "vue";
import type { Task } from "../../tasks/models/TaskModel";

const props = defineProps<{
  tasks: Task[];
}>();

const totalTasks = computed(() => props.tasks?.length || 0);

const completedCount = computed(
  () => props.tasks?.filter((t) => t.completed).length || 0,
);
const pendingCount = computed(
  () => props.tasks?.filter((t) => !t.completed).length || 0,
);

const completionPercentage = computed(() => {
  if (totalTasks.value === 0) return 0;
  return Math.round((completedCount.value / totalTasks.value) * 100);
});
</script>

<template>
  <article
    class="bg-[#faf9f5] border border-black/5 rounded-3xl p-8 md:p-10 font-['Manrope'] flex flex-col justify-center items-center"
  >
    <div class="flex flex-col items-center w-full max-w-[280px]">
      <h3
        class="text-[11px] font-bold tracking-[0.18em] text-black/40 uppercase mb-8"
      >
        Resumen de tareas
      </h3>

      <div class="flex items-end justify-center gap-6 md:gap-10 mb-10 w-full">
        <div class="flex flex-col gap-1.5 items-center">
          <span
            class="text-[28px] md:text-[40px] leading-none font-extrabold text-black/90"
            >{{ completedCount }}</span
          >
          <span
            class="text-[10px] font-bold tracking-widest text-black/40 uppercase"
            >Completados</span
          >
        </div>

        <div class="flex flex-col gap-1.5 items-center">
          <span
            class="text-[28px] md:text-[40px] leading-none font-extrabold text-black/60"
            >{{ pendingCount }}</span
          >
          <span
            class="text-[10px] font-bold tracking-widest text-black/40 uppercase"
            >Pendientes</span
          >
        </div>
      </div>

      <!-- Barra de porcentaje -->
      <div class="w-full flex flex-col gap-3 items-center">
        <div class="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
          <div
            class="h-full bg-black/80 transition-all duration-1000 ease-out rounded-full"
            :style="{ width: `${completionPercentage}%` }"
          ></div>
        </div>
        <p
          class="text-[11px] font-bold text-black/40 uppercase tracking-widest"
        >
          {{ completionPercentage }}% completado
        </p>
      </div>
    </div>
  </article>
</template>
