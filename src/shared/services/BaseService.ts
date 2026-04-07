import {
  openDB,
  type DBSchema,
  type IDBPDatabase,
  type StoreNames,
  type StoreValue,
  type StoreKey,
} from "idb";

export interface BaseEntity {
  id: string;
  createdAt: number;
  updatedAt: number;
  lastSeen?: number;
}

export abstract class BaseService<
  DBS extends DBSchema,
  StoreName extends StoreNames<DBS>,
  T extends StoreValue<DBS, StoreName> & BaseEntity,
> {
  protected dbName: string;
  protected storeName: StoreName;
  protected version: number;

  private db?: IDBPDatabase<DBS>;

  constructor(dbName: string, storeName: StoreName, version = 1) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.version = version;
  }

  protected abstract schema(db: IDBPDatabase<DBS>): void;

  protected async getDB(): Promise<IDBPDatabase<DBS>> {
    if (!this.db) {
      this.db = await openDB<DBS>(this.dbName, this.version, {
        upgrade: (db) => this.schema(db),
      });
    }

    return this.db;
  }

  async getAll(): Promise<T[]> {
    const db = await this.getDB();
    return (await db.getAll(this.storeName)) as T[];
  }

  async getById(id: StoreKey<DBS, StoreName>): Promise<T | undefined> {
    const db = await this.getDB();
    return (await db.get(this.storeName, id)) as T | undefined;
  }

  async create(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T> {
    const db = await this.getDB();

    const now = Date.now();

    const entity = {
      ...(data as T),
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      lastSeen: now,
    } as T;

    await db.put(this.storeName, entity);

    return entity;
  }

  async update(
    id: StoreKey<DBS, StoreName>,
    partial: Partial<T>,
    updateTimestamp = true,
  ): Promise<T | null> {
    const db = await this.getDB();

    const existing = (await db.get(this.storeName, id)) as T | undefined;
    if (!existing) return null;

    const updated = {
      ...existing,
      ...partial,
      updatedAt: updateTimestamp ? Date.now() : existing.updatedAt,
      lastSeen: Date.now(),
    } as T;

    await db.put(this.storeName, updated);

    return updated;
  }

  async delete(id: StoreKey<DBS, StoreName>): Promise<void> {
    const db = await this.getDB();
    await db.delete(this.storeName, id);
  }

  async clear(): Promise<void> {
    const db = await this.getDB();
    await db.clear(this.storeName);
  }
}
