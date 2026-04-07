import { ref, watch } from "vue";

const savedView = localStorage.getItem("isGridView_RecentNotes");
const isDashboardGridView = ref(savedView ? JSON.parse(savedView) : true);

watch(isDashboardGridView, (newVal) => {
  localStorage.setItem("isGridView_RecentNotes", JSON.stringify(newVal));
});

export const useDashboardView = () => {
  const toggleDashboardView = () => {
    isDashboardGridView.value = !isDashboardGridView.value;
  };

  return {
    isDashboardGridView,
    toggleDashboardView,
  };
};
