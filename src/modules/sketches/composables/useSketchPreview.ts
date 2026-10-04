import { ref, watch } from "vue";

const saved = localStorage.getItem("showPreview_SketchList");
const showPreview = ref(saved ? JSON.parse(saved) : true);

watch(showPreview, (newVal) => {
  localStorage.setItem("showPreview_SketchList", JSON.stringify(newVal));
});

export const useSketchPreview = () => {
  return {
    showPreview,
  };
};
