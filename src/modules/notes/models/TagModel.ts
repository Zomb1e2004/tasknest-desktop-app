import type { BaseEntity } from "../../../shared/services/BaseService";

export interface Tag extends BaseEntity {
  name: string;
  color?: string;
}
