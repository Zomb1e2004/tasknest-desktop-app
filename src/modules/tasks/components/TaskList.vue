<script setup lang="ts">
import { ref } from "vue";
import type { Task } from "../models/TaskModel";
import TaskCard from "./TaskCard.vue";
import { useTasksView } from "../composables/useTasksView";
import ActionCard from "../../../shared/components/ActionCard.vue";
import List from "../../../shared/components/List.vue";
import TaskCreateModal from "./TaskCreateModal.vue";
import NoContent from "../../../shared/components/NoContent.vue";

const { isGridView } = useTasksView();
const showCreateModal = ref(false);

withDefaults(
  defineProps<{
    tasks: Task[];
    showOptions?: boolean;
  }>(),
  {
    showOptions: true,
  },
);

const emit = defineEmits<{
  (e: "delete", id: string): void;
  (e: "update", id: string, updates: Partial<Task>): void;
  (e: "tagCreated"): void;
  (e: "add", task: Partial<Task>): void;
}>();
</script>

<template>
  <List :items="tasks" :is-grid-view="isGridView">
    <template #action-card>
      <ActionCard
        icon="add"
        text="Añadir nueva tarea"
        variant="dark"
        :class="
          isGridView ? 'w-full min-h-[160px]' : 'w-full shrink-0 min-h-[140px]'
        "
        @click="showCreateModal = true"
      />
    </template>

    <template #item="{ item }">
      <TaskCard
        :task="item as Task"
        :is-grid="isGridView"
        :show-options="showOptions"
        @delete="emit('delete', $event)"
        @update="(id, updates) => emit('update', id, updates)"
        @tag-created="emit('tagCreated')"
      />
    </template>

    <template #empty-state>
      <NoContent
        icon="assignment"
        title="Tu lista de tareas está vacía"
        description="Este es el lugar perfecto para organizar tus pendientes. Crea tu primera tarea para empezar."
      />
    </template>
  </List>

  <TaskCreateModal
    v-if="showCreateModal"
    @close="showCreateModal = false"
    @save="emit('add', $event)"
  />
</template>
