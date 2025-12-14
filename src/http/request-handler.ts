import { BaseEntity, Response, AuthUser } from "../types";

export abstract class RequestHandler<T extends BaseEntity> {
  protected params: Record<string, any> = {};

  protected query: Record<string, any> = {};

  protected body: unknown;

  protected user?: AuthUser;

  protected service: any;

  constructor(service?: any) {
    if (service) {
      this.service = service;
    }
  }

  abstract execute(): Promise<Response<T>>;

  protected ok(data: T): Response<T> {
    return { status: 200, data };
  }

  protected created(data: T): Response<T> {
    return { status: 201, data };
  }

  protected noContent(): Response<null> {
    return { status: 204 };
  }

  protected badRequest(message?: string): Response<null> {
    return { status: 400, error: message || "Bad request" };
  }

  protected unauthorized(message?: string): Response<null> {
    return { status: 401, error: message || "Unauthorized" };
  }

  protected forbidden(message?: string): Response<null> {
    return { status: 403, error: message || "Forbidden" };
  }

  protected notFound(message?: string): Response<null> {
    return { status: 404, error: message || "Not found" };
  }

  protected conflict(message?: string): Response<null> {
    return { status: 409, error: message || "Conflict" };
  }

  protected internalServerError(message?: string): Response<null> {
    return { status: 500, error: message || "Internal server error" };
  }

  setParams(params: Record<string, any>): this {
    this.params = params;
    return this;
  }

  setQuery(query: Record<string, any>): this {
    this.query = query;
    return this;
  }

  setBody(body: unknown): this {
    this.body = body;
    return this;
  }

  setUser(user: AuthUser): this {
    this.user = user;
    return this;
  }

  setService(service: any): this {
    this.service = service;
    return this;
  }
}
