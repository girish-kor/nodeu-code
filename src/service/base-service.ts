import { BaseEntity } from "../types";

export abstract class BaseService<T extends BaseEntity> {
  constructor(protected repository: any) {}

  async create(data: Omit<T, "id">): Promise<T> {
    return this.repository.create(data);
  }

  async findById(id: T["id"]): Promise<T | null> {
    return this.repository.findById(id);
  }

  async update(id: T["id"], data: Partial<T>): Promise<T> {
    return this.repository.update(id, data);
  }

  async delete(id: T["id"]): Promise<boolean> {
    return this.repository.delete(id);
  }

  async list(options?: any): Promise<T[]> {
    return this.repository.list(options);
  }

  async count(options?: any): Promise<number> {
    return this.repository.count(options);
  }
}
