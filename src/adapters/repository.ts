import { BaseEntity, QueryOptions } from "../types";

export abstract class Repository<T extends BaseEntity> {
  constructor(protected dataSource: any) {}

  abstract create(data: Omit<T, "id">): Promise<T>;

  abstract findById(id: T["id"]): Promise<T | null>;

  abstract findAll(options?: QueryOptions): Promise<T[]>;

  abstract update(id: T["id"], data: Partial<T>): Promise<T>;

  abstract delete(id: T["id"]): Promise<boolean>;

  abstract count(options?: QueryOptions): Promise<number>;
}

export class InMemoryRepository<T extends BaseEntity> extends Repository<T> {
  private data = new Map<T["id"], T>();

  async create(data: Omit<T, "id">): Promise<T> {
    const id = Math.random().toString(36).substr(2, 9) as T["id"];
    const entity = { ...data, id } as T;
    this.data.set(id, entity);
    return entity;
  }

  async findById(id: T["id"]): Promise<T | null> {
    return this.data.get(id) || null;
  }

  async findAll(options?: QueryOptions): Promise<T[]> {
    let items = Array.from(this.data.values());

    if (options?.where) {
      items = items.filter((item) =>
        Object.entries(options.where!).every(
          ([key, value]) => (item as any)[key] === value,
        ),
      );
    }

    if (options?.orderBy) {
      const [field, order] = Object.entries(options.orderBy)[0];
      items.sort((a, b) => {
        const aVal = (a as any)[field];
        const bVal = (b as any)[field];
        if (order === "asc") {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }

    if (options?.offset) {
      items = items.slice(options.offset);
    }

    if (options?.limit) {
      items = items.slice(0, options.limit);
    }

    return items;
  }

  async update(id: T["id"], data: Partial<T>): Promise<T> {
    const existing = this.data.get(id);
    if (!existing) throw new Error("Entity not found");
    const updated = { ...existing, ...data };
    this.data.set(id, updated);
    return updated;
  }

  async delete(id: T["id"]): Promise<boolean> {
    return this.data.delete(id);
  }

  async count(options?: QueryOptions): Promise<number> {
    return (await this.findAll(options)).length;
  }
}
