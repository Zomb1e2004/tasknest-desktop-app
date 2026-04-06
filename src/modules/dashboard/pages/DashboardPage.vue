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

import tasksJson from "../../../mock-data/tasks.json";

import type { Note } from "../../notes/models/NoteModel";
import type { Task } from "../../tasks/models/TaskModel";
import { getRecentNotes } from "../../../shared/utils/getRecentNotes";
import NoteSummary from "../components/NoteSummary.vue";
import ScrollToTop from "../../../shared/components/ScrollToTop.vue";
import ScrollDown from "../../../shared/components/ScrollDown.vue";
import { noteService } from "../../notes/services/NoteService";

const notes = ref<Note[]>([]);
const tasks: Task[] = tasksJson as Task[];

const pendingTasks = getPendingTasksForToday(tasks);
const recentNotes = computed(() => getRecentNotes(notes.value));

onMounted(async () => {
  notes.value = await noteService.getAll();
});

const actualDate = formatDate(new Date());
const actualGretting = getGreeting();
const { userName } = useUser();

const handleNoteDelete = (id: string) => {
  notes.value = notes.value.filter((n) => n.id !== id);
};
</script>

<template>
  <Page>
    <div class="flex flex-col gap-10">
      <DashboardHeader
        :actual-date="actualDate"
        :user-name="userName"
        :actual-greeting="actualGretting"
      />

      <div class="flex flex-col gap-10">
        <div
          class="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-6 w-full"
        >
          <PendingTasks
            :tasks="pendingTasks"
            :max-tasks="4"
            class="lg:col-span-2 2xl:col-span-2"
          />
          <NoteSummary :notes="notes" class="lg:col-span-1 2xl:col-span-1" />
          <TaskSummary :tasks="tasks" class="lg:col-span-1 2xl:col-span-1" />
        </div>
        <RecentNotes
          :notes="recentNotes"
          :max-notes="5"
          @delete="handleNoteDelete"
        />
      </div>
    </div>

    <ScrollToTop />
    <ScrollDown />
  </Page>
</template>
