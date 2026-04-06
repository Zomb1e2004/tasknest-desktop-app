import { BaseService } from "../../../shared/services/BaseService";
import type { Tag } from "../models/TagModel";
import type { AppDB } from "./NoteService";

class TagService extends BaseService<AppDB, "tags", Tag> {
  constructor() {
    super("app-db", "tags", 2);
  }

  protected schema(): void {
    // Schema is handled in NoteService to avoid conflicts
  }

  async getByName(name: string): Promise<Tag | undefined> {
    const db = await this.getDB();
    return db.getFromIndex("tags", "by-name", name);
  }
}

export const tagService = new TagService();
