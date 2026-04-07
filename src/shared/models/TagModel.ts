import type { BaseEntity } from "../services/BaseService";

export interface Tag extends BaseEntity {
  name: string;
  color?: string;
}
