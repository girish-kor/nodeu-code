import { BaseEntity, RouteDefinition, Middleware } from "../types";

export class RouteBuilder<T extends BaseEntity> {
  private routes: RouteDefinition[] = [];

  get(path: string, handler: Function, middleware?: Middleware[]): this {
    this.routes.push({
      method: "GET",
      path,
      handler,
      middleware,
    });
    return this;
  }

  post(path: string, handler: Function, middleware?: Middleware[]): this {
    this.routes.push({
      method: "POST",
      path,
      handler,
      middleware,
    });
    return this;
  }

  put(path: string, handler: Function, middleware?: Middleware[]): this {
    this.routes.push({
      method: "PUT",
      path,
      handler,
      middleware,
    });
    return this;
  }

  delete(path: string, handler: Function, middleware?: Middleware[]): this {
    this.routes.push({
      method: "DELETE",
      path,
      handler,
      middleware,
    });
    return this;
  }

  patch(path: string, handler: Function, middleware?: Middleware[]): this {
    this.routes.push({
      method: "PATCH",
      path,
      handler,
      middleware,
    });
    return this;
  }

  build(): RouteDefinition[] {
    return [...this.routes];
  }

  getRoutes(): RouteDefinition[] {
    return this.build();
  }
}
