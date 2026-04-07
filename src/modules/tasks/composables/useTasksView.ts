import { ref, watch } from "vue";
import { useToast } from "../../../shared/composables/useToast";

const savedView = localStorage.getItem("isGridView_TaskList");
const isGridView = ref(savedView ? JSON.parse(savedView) : true);

watch(isGridView, (newVal) => {
  localStorage.setItem("isGridView_TaskList", JSON.stringify(newVal));
});

export const useTasksView = () => {
  const { addToast } = useToast();

  const toggleView = () => {
    isGridView.value = !isGridView.value;

    addToast({
      title: "Vista actualizada",
      message: isGridView.value
        ? "Cambiado a vista de cuadrícula"
        : "Cambiado a vista de lista",
      type: "info",
      duration: 2000,
    });
  };

  return {
    isGridView,
    toggleView,
  };
};
