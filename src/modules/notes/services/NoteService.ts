import type { DBSchema, IDBPDatabase } from "idb";
import { BaseService } from "../../../shared/services/BaseService";
import type { Note } from "../models/NoteModel";

export interface AppDB extends DBSchema {
  notes: {
    key: string;
    value: Note;
    indexes: {
      "by-createdAt": string;
      "by-updatedAt": string;
    };
  };
}

class NoteService extends BaseService<AppDB, "notes", Note> {
  constructor() {
    super("app-db", "notes", 1);
  }

  protected schema(db: IDBPDatabase<AppDB>): void {
    if (!db.objectStoreNames.contains("notes")) {
      const store = db.createObjectStore("notes", {
        keyPath: "id",
      });

      store.createIndex("by-createdAt", "createdAt");
      store.createIndex("by-updatedAt", "updatedAt");
    }
  }

  async incrementVisits(id: string): Promise<Note | null> {
    const note = await this.getById(id);
    if (!note) return null;

    return this.update(id, {
      totalVisits: (note.totalVisits ?? 0) + 1,
    });
  }

  async getRecent(): Promise<Note[]> {
    const db = await this.getDB();
    return db.getAllFromIndex("notes", "by-updatedAt");
  }
}

export const noteService = new NoteService();
