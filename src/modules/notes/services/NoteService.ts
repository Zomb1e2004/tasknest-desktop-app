import type { DBSchema, IDBPDatabase } from "idb";
import { BaseService } from "../../../shared/services/BaseService";
import type { Note } from "../models/NoteModel";
import type { Tag } from "../models/TagModel";

export interface AppDB extends DBSchema {
  notes: {
    key: string;
    value: Note;
    indexes: {
      "by-createdAt": string;
      "by-updatedAt": string;
    };
  };
  tags: {
    key: string;
    value: Tag;
    indexes: {
      "by-name": string;
    };
  };
}

class NoteService extends BaseService<AppDB, "notes", Note> {
  constructor() {
    super("app-db", "notes", 2);
  }

  protected schema(db: IDBPDatabase<AppDB>): void {
    if (!db.objectStoreNames.contains("notes")) {
      const store = db.createObjectStore("notes", {
        keyPath: "id",
      });

      store.createIndex("by-createdAt", "createdAt");
      store.createIndex("by-updatedAt", "updatedAt");
    }

    if (!db.objectStoreNames.contains("tags")) {
      const store = db.createObjectStore("tags", {
        keyPath: "id",
      });

      store.createIndex("by-name", "name", { unique: true });
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

  async removeTagFromAllNotes(tagName: string): Promise<void> {
    const db = await this.getDB();
    const notes = await db.getAll("notes");

    for (const note of notes) {
      if (note.tags.includes(tagName)) {
        const updatedTags = note.tags.filter((t) => t !== tagName);
        await this.update(note.id, { tags: updatedTags });
      }
    }
  }
}

export const noteService = new NoteService();
