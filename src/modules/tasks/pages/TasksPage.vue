<script setup lang="ts">
import Page from "../../../shared/components/Page.vue";
import TasksHeader from "../components/TasksHeader.vue";
import { useUser } from "../../../shared/composables/useUser";
import TaskListTool from "../components/TaskListTool.vue";
import TaskList from "../components/TaskList.vue";
import ScrollDown from "../../../shared/components/ScrollDown.vue";
import ScrollToTop from "../../../shared/components/ScrollToTop.vue";
import type { Task } from "../models/TaskModel";
import { ref, computed, onMounted } from "vue";
import { useTasksFilter } from "../composables/useTasksFilter";
import { useTasksSort } from "../composables/useTasksSort";
import { taskService } from "../services/TaskService";

const { userName } = useUser();
const { selectedStatus, selectedTag } = useTasksFilter();
const { getSortedTasks } = useTasksSort();

const mockTasks = ref<Task[]>([]);

const loadTasks = async () => {
  mockTasks.value = await taskService.getAll();
};

onMounted(loadTasks);

const filteredTasks = computed(() => {
  return mockTasks.value.filter((task) => {
    const matchesStatus = 
      !selectedStatus.value || 
      (selectedStatus.value === "completed" ? task.completed : !task.completed);
    
    const matchesTag = 
      !selectedTag.value || 
      task.tags?.includes(selectedTag.value);

    return matchesStatus && matchesTag;
  });
});

const sortedTasks = getSortedTasks(filteredTasks);

const handleTagDeleted = async (tagName: string) => {
  await taskService.removeTagFromAllTasks(tagName);
  await loadTasks();
};

const handleAddTask = async (newTask: Partial<Task>) => {
  await taskService.create(newTask as any);
  await loadTasks();
};

const handleDeleteTask = async (id: string) => {
  await taskService.delete(id);
  await loadTasks();
};

const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
  await taskService.update(id, updates);
  await loadTasks();
};
</script>

<template>
  <Page>
    <div class="flex flex-col gap-6 md:gap-8">
      <TasksHeader :user-name="userName" />
      <TaskListTool @tag-deleted="handleTagDeleted" />
        <TaskList 
          :tasks="sortedTasks" 
          @delete="handleDeleteTask"
          @update="handleUpdateTask"
          @add="handleAddTask"
          @tag-created="loadTasks" 
        />
    </div>

    <ScrollToTop />
    <ScrollDown />
  </Page>
</template>
