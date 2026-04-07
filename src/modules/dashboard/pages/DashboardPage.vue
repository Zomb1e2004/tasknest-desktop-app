<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import Page from "../../../shared/components/Page.vue";

import { formatDate } from "../../../shared/utils/formatDate";
import { getGreeting } from "../../../shared/utils/getGreeting";
import { getPendingTasksForToday } from "../../../shared/utils/getPendingTasks";
import { useUser } from "../../../shared/composables/useUser";

import DashboardHeader from "../components/DashboardHeader.vue";
import TaskSummary from "../components/TaskSummary.vue";
import RecentNotes from "../components/RecentNotes.vue";
import PendingTasks from "../components/PendingTasks.vue";

import type { Note } from "../../notes/models/NoteModel";
import type { Task } from "../../tasks/models/TaskModel";
import { getRecentNotes } from "../../../shared/utils/getRecentNotes";
import NoteSummary from "../components/NoteSummary.vue";
import ScrollToTop from "../../../shared/components/ScrollToTop.vue";
import ScrollDown from "../../../shared/components/ScrollDown.vue";
import { noteService } from "../../notes/services/NoteService";
import { taskService } from "../../tasks/services/TaskService";

const notes = ref<Note[]>([]);
const tasks = ref<Task[]>([]);

const pendingTasks = computed(() => getPendingTasksForToday(tasks.value));
const recentNotes = computed(() => getRecentNotes(notes.value));

onMounted(async () => {
  const [dataNotes, dataTasks] = await Promise.all([
    noteService.getAll(),
    taskService.getAll(),
  ]);
  notes.value = dataNotes;
  tasks.value = dataTasks;
});

const actualDate = formatDate(new Date());
const actualGretting = getGreeting();
const { userName } = useUser();

const handleNoteDelete = async (id: string) => {
  await noteService.delete(id);
  notes.value = notes.value.filter((n) => n.id !== id);
};

const handleNoteUpdate = async (id: string, updates: Partial<Note>) => {
  await noteService.update(id, updates);
  const updatedNote = await noteService.getById(id);
  if (updatedNote) {
    notes.value = notes.value.map((n) => (n.id === id ? updatedNote : n));
  }
};

const handleTaskDelete = async (id: string) => {
  await taskService.delete(id);
  tasks.value = tasks.value.filter((t) => t.id !== id);
};

const handleTaskUpdate = async (id: string, updates: Partial<Task>) => {
  await taskService.update(id, updates);
  const updatedTask = await taskService.getById(id);
  if (updatedTask) {
    tasks.value = tasks.value.map((t) => (t.id === id ? updatedTask : t));
  }
};
</script>

<template>
  <Page>
    <div class="flex flex-col gap-7.5">
      <DashboardHeader
        :actual-date="actualDate"
        :user-name="userName"
        :actual-greeting="actualGretting"
      />

      <div class="flex flex-col gap-8.5">
        <div
          class="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-6 w-full"
        >
          <PendingTasks
            :tasks="pendingTasks"
            :max-tasks="3"
            class="lg:col-span-2 2xl:col-span-2"
            @update="handleTaskUpdate"
            @delete="handleTaskDelete"
          />
          <NoteSummary :notes="notes" class="lg:col-span-1 2xl:col-span-1" />
          <TaskSummary :tasks="tasks" class="lg:col-span-1 2xl:col-span-1" />
        </div>
        <RecentNotes
          :notes="recentNotes"
          :max-notes="4"
          @delete="handleNoteDelete"
          @update="handleNoteUpdate"
        />
      </div>
    </div>

    <ScrollToTop />
    <ScrollDown />
  </Page>
</template>
