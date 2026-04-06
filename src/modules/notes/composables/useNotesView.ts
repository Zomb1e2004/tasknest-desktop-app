import { ref, watch } from "vue";
import { useToast } from "../../../shared/composables/useToast";

const savedView = localStorage.getItem("isGridView_NoteList");
const isGridView = ref(savedView ? JSON.parse(savedView) : true);

watch(isGridView, (newVal) => {
  localStorage.setItem("isGridView_NoteList", JSON.stringify(newVal));
});

export const useNotesView = () => {
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
