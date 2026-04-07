import type { DBSchema, IDBPDatabase } from "idb";
import { BaseService } from "../../../shared/services/BaseService";
import type { Task } from "../models/TaskModel";

export interface TaskDB extends DBSchema {
  tasks: {
    key: string;
    value: Task;
    indexes: {
      "by-createdAt": number;
      "by-updatedAt": number;
    };
  };
}

class TaskService extends BaseService<TaskDB, "tasks", Task> {
  constructor() {
    super("tasks-db", "tasks", 1);
  }

  protected schema(db: IDBPDatabase<TaskDB>): void {
    if (!db.objectStoreNames.contains("tasks")) {
      const store = db.createObjectStore("tasks", {
        keyPath: "id",
      });

      store.createIndex("by-createdAt", "createdAt");
      store.createIndex("by-updatedAt", "updatedAt");
    }
  }

  async getRecent(): Promise<Task[]> {
    const db = await this.getDB();
    return db.getAllFromIndex("tasks", "by-updatedAt");
  }

  async removeTagFromAllTasks(tagName: string): Promise<void> {
    const db = await this.getDB();
    const tasks = await db.getAll("tasks");

    for (const task of tasks) {
      if (task.tags.includes(tagName)) {
        const updatedTags = task.tags.filter((t) => t !== tagName);
        await this.update(task.id, { tags: updatedTags });
      }
    }
  }
}

export const taskService = new TaskService();
