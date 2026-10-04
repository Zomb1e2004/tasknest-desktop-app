import type { DBSchema, IDBPDatabase } from "idb";
import { BaseService } from "../../../shared/services/BaseService";
import type { Sketch } from "../models/SketchModel";

export interface SketchDB extends DBSchema {
  sketches: {
    key: string;
    value: Sketch;
    indexes: {
      "by-createdAt": number;
      "by-updatedAt": number;
    };
  };
}

class SketchService extends BaseService<SketchDB, "sketches", Sketch> {
  constructor() {
    super("sketches-db", "sketches", 1);
  }

  protected schema(db: IDBPDatabase<SketchDB>): void {
    if (!db.objectStoreNames.contains("sketches")) {
      const store = db.createObjectStore("sketches", {
        keyPath: "id",
      });

      store.createIndex("by-createdAt", "createdAt");
      store.createIndex("by-updatedAt", "updatedAt");
    }
  }

  async getRecent(): Promise<Sketch[]> {
    const db = await this.getDB();
    return db.getAllFromIndex("sketches", "by-updatedAt");
  }
}

export const sketchService = new SketchService();
