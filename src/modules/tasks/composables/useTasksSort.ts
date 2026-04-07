import { ref, watch, computed, type Ref, unref } from "vue";
import type { Task } from "../models/TaskModel";

const savedOption = localStorage.getItem("tasks_sortOption") || "createdAt";
const savedOrder = localStorage.getItem("tasks_sortOrder") || "desc";

const sortOption = ref(savedOption);
const sortOrder = ref<"asc" | "desc">(savedOrder as "asc" | "desc");

watch(sortOption, (newVal) => {
  localStorage.setItem("tasks_sortOption", newVal);
});

watch(sortOrder, (newVal) => {
  localStorage.setItem("tasks_sortOrder", newVal);
});

export const useTasksSort = () => {
  const getSortedTasks = (tasks: Ref<Task[]> | Task[]) => {
    return computed(() => {
      const tasksArray = unref(tasks);
      return [...tasksArray].sort((a, b) => {
        if (sortOption.value === "priority") {
          const priorities = { Alto: 3, Medio: 2, Bajo: 1 };
          const valA = priorities[a.priority];
          const valB = priorities[b.priority];
          return sortOrder.value === "asc" ? valA - valB : valB - valA;
        }

        if (sortOption.value === "createdAt") {
          const timeA = a.createdAt;
          const timeB = b.createdAt;
          return sortOrder.value === "asc" ? timeA - timeB : timeB - timeA;
        }

        const valA = String(
          a[sortOption.value as keyof Task] || "",
        ).toLowerCase();
        const valB = String(
          b[sortOption.value as keyof Task] || "",
        ).toLowerCase();

        if (valA < valB) return sortOrder.value === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder.value === "asc" ? 1 : -1;
        return 0;
      });
    });
  };

  return {
    sortOption,
    sortOrder,
    getSortedTasks,
  };
};
