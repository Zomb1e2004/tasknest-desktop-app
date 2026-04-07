import { ref } from "vue";

const selectedTag = ref<string | null>(null);
const selectedStatus = ref<string | null>(null); // "completed", "pending", or null (all)

export const useTasksFilter = () => {
  return {
    selectedTag,
    selectedStatus,
  };
};
