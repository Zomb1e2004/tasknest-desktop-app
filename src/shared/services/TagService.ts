import { BaseService } from "./BaseService";
import type { Tag } from "../models/TagModel";
import type { AppDB } from "../../modules/notes/services/NoteService";

class TagService extends BaseService<AppDB, "tags", Tag> {
  constructor() {
    super("app-db", "tags", 2);
  }

  protected schema(): void {}

  async getByName(name: string): Promise<Tag | undefined> {
    const db = await this.getDB();
    return db.getFromIndex("tags", "by-name", name);
  }
}

export const tagService = new TagService();
