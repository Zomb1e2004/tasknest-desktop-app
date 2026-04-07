import type { BaseEntity } from "../../../shared/services/BaseService";

export interface Task extends BaseEntity {
  title: string;
  description: string;
  completed: boolean;
  priority: "Alto" | "Medio" | "Bajo";
  tags: string[];
}
