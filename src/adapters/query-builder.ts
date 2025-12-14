import { QueryOptions } from "../types";

export class QueryBuilder<T> {
  private conditions: Record<string, any> = {};
  private orderByConditions: Record<string, "asc" | "desc"> = {};
  private limitValue?: number;
  private offsetValue?: number;

  where(field: keyof T, operator: string, value: any): this {
    this.conditions[field as string] = { operator, value };
    return this;
  }

  orderBy(field: keyof T, direction: "asc" | "desc" = "asc"): this {
    this.orderByConditions[field as string] = direction;
    return this;
  }

  limit(limit: number): this {
    this.limitValue = limit;
    return this;
  }

  offset(offset: number): this {
    this.offsetValue = offset;
    return this;
  }

  build(): QueryOptions {
    return {
      where: this.conditions,
      orderBy: this.orderByConditions,
      limit: this.limitValue,
      offset: this.offsetValue,
    };
  }

  reset(): this {
    this.conditions = {};
    this.orderByConditions = {};
    this.limitValue = undefined;
    this.offsetValue = undefined;
    return this;
  }
}
