<script setup lang="ts">
import type { Task } from "../../tasks/models/TaskModel";
import NoContent from "../../../shared/components/NoContent.vue";
import TaskCard from "../../tasks/components/TaskCard.vue";

withDefaults(
  defineProps<{
    tasks: Task[];
    maxTasks?: number;
  }>(),
  {
    maxTasks: 3,
  }
);

const emit = defineEmits<{
  (e: "update", id: string, updates: Partial<Task>): void;
  (e: "delete", id: string): void;
}>();
</script>

<template>
  <section
    class="bg-[#faf9f5] border border-black/5 rounded-3xl p-8 md:p-5.5 font-['Manrope']"
  >
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-xl font-bold text-black/90">Tareas pendientes</h2>
      <button
        @click="$router.push('/tasks')"
        class="text-xs font-bold tracking-[0.15em] uppercase text-black/40 hover:text-black transition-colors cursor-pointer"
      >
        Ver todas
      </button>
    </div>

    <div v-if="tasks.length > 0" class="flex flex-col gap-3">
      <TaskCard
        v-for="task in tasks.slice(0, maxTasks)"
        :key="task.id"
        :task="task"
        :show-options="false"
        @update="(id, updates) => emit('update', id, updates)"
        @delete="(id) => emit('delete', id)"
      />
    </div>

    <NoContent
      v-else
      title="¡Todo al día!"
      description="¡A relajarse! No tienes tareas pendientes por realizar"
    />
  </section>
</template>
