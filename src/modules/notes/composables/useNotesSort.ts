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
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        if (sortOption.value === "totalVisits") {
          const numA = a.totalVisits || 0;
          const numB = b.totalVisits || 0;
          return sortOrder.value === "asc" ? numA - numB : numB - numA;
        }

        let valA = a[sortOption.value as keyof Note] as string | number;
        let valB = b[sortOption.value as keyof Note] as string | number;

        if (
          sortOption.value === "createdAt" ||
          sortOption.value === "updatedAt"
        ) {
          const timeA = Number(valA);
          const timeB = Number(valB);
          return sortOrder.value === "asc" ? timeA - timeB : timeB - timeA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();

        if (strA < strB) return sortOrder.value === "asc" ? -1 : 1;
        if (strA > strB) return sortOrder.value === "asc" ? 1 : -1;
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
