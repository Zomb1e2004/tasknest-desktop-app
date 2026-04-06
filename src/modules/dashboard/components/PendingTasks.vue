<script setup lang="ts">
import type { Task } from "../../tasks/models/TaskModel";
import { motion } from "motion-v";
import NoContent from "../../../shared/components/NoContent.vue";

withDefaults(
  defineProps<{
    tasks: Task[];
    maxTasks?: number;
  }>(),
  {
    maxTasks: 3,
  },
);

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getPriorityClass = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-black text-white";
    case "medium":
      return "bg-black/10 text-black/80";
    case "low":
      return "border border-black/20 text-black/60 bg-transparent";
    default:
      return "bg-black/5 text-black/50";
  }
};
</script>

<template>
  <section
    class="bg-[#faf9f5] border border-black/5 rounded-3xl p-8 md:p-10 font-['Manrope']"
  >
    <div class="flex items-center justify-between mb-8">
      <h2 class="text-xl font-bold text-black/90">Tareas pendientes</h2>
      <button
        class="text-xs font-bold tracking-[0.15em] uppercase text-black/40 hover:text-black transition-colors cursor-pointer"
      >
        Ver todas
      </button>
    </div>

    <div v-if="tasks.length > 0" class="flex flex-col gap-7">
      <motion.article
        v-for="(task, index) in tasks.slice(0, maxTasks)"
        :key="task.id"
        layout
        :initial="{ opacity: 0, y: 0 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.3, delay: index * 0.05, ease: 'easeOut' }"
        class="flex items-start gap-4 group cursor-pointer"
      >
        <div
          class="w-[20px] h-[20px] border-2 border-black/20 rounded-[5px] mt-0.5 transition-colors group-hover:border-black/50 shrink-0"
        ></div>

        <div class="flex-1 flex flex-col gap-1.5">
          <h3 class="text-[15px] font-bold text-black/80 leading-none">
            {{ task.title }}
          </h3>
          <div class="flex items-center gap-3">
            <span
              :class="[
                'px-2 py-[2px] text-[10px] font-bold uppercase rounded',
                getPriorityClass(task.priority),
              ]"
            >
              {{ task.priority }}
            </span>
            <span class="text-xs text-black/40 font-semibold tracking-wide">
              # <span class="capitalize">{{ task.tag }}</span>
            </span>
          </div>
        </div>

        <div class="text-[13px] font-semibold text-black/30 pt-0.5 shrink-0">
          {{ formatTime(task.dueDate) }}
        </div>
      </motion.article>
    </div>

    <NoContent
      v-else
      title="¡Todo al día!"
      description="¡A relajarse! No tienes tareas pendientes por realizar"
    />
  </section>
</template>
