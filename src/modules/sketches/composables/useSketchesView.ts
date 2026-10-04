import { ref, watch } from "vue";

const savedView = localStorage.getItem("isGridView_SketchList");
const isGridView = ref(savedView ? JSON.parse(savedView) : true);

watch(isGridView, (newVal) => {
  localStorage.setItem("isGridView_SketchList", JSON.stringify(newVal));
});

export const useSketchesView = () => {
  return {
    isGridView,
  };
};
