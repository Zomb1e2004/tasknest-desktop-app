import { ref } from "vue";

const selectedTag = ref<string | null>(null);
const selectedFormat = ref<string | null>(null);

export const useNotesFilter = () => {
  return {
    selectedTag,
    selectedFormat,
  };
};
