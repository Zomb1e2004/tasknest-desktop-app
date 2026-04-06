import { ref, watch, computed, type Ref, unref } from "vue";
import type { Note } from "../models/NoteModel";

const savedOption = localStorage.getItem("notes_sortOption") || "updatedAt";
const savedOrder = localStorage.getItem("notes_sortOrder") || "desc";

const sortOption = ref(savedOption);
const sortOrder = ref(savedOrder);

watch(sortOption, (newVal) => {
  localStorage.setItem("notes_sortOption", newVal);
});

watch(sortOrder, (newVal) => {
  localStorage.setItem("notes_sortOrder", newVal);
});

export const useNotesSort = () => {
  const getSortedNotes = (notes: Ref<Note[]> | Note[]) => {
    return computed(() => {
      const notesArray = unref(notes);
      return [...notesArray].sort((a, b) => {
        if (sortOption.value === "totalVisits") {
          const numA = a.totalVisits || 0;
          const numB = b.totalVisits || 0;
          return sortOrder.value === "asc" ? numA - numB : numB - numA;
        }

        let valA = a[sortOption.value as keyof Note] as string;
        let valB = b[sortOption.value as keyof Note] as string;

        if (
          sortOption.value === "createdAt" ||
          sortOption.value === "updatedAt"
        ) {
          valA = new Date(valA).getTime().toString();
          valB = new Date(valB).getTime().toString();
          return sortOrder.value === "asc"
            ? Number(valA) - Number(valB)
            : Number(valB) - Number(valA);
        }

        valA = valA.toLowerCase();
        valB = valB.toLowerCase();

        if (valA < valB) return sortOrder.value === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder.value === "asc" ? 1 : -1;
        return 0;
      });
    });
  };

  return {
    sortOption,
    sortOrder,
    getSortedNotes,
  };
};
