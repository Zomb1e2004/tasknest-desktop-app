import type { BaseEntity } from "../../../shared/services/BaseService";

export interface Note extends BaseEntity {
  title: string;
  content: string;
  tags: string[];
  totalVisits: number;
  format: "md" | "txt";
  isPinned: boolean;
  lastSeen?: number;
}
