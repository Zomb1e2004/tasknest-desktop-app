import type { Note } from "../../modules/notes/models/NoteModel";

export const getRecentNotes = (notes: Note[]): Note[] => {
  return [...notes].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt).getTime();
    const dateB = new Date(b.updatedAt || b.createdAt).getTime();
    return dateB - dateA;
  });
};
