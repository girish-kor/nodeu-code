import { ApiResponse } from "../types";

export class ResponseBuilder<T = any> {
  private response: ApiResponse<T> = {
    status: 200,
  };

  status(status: number): this {
    this.response.status = status;
    return this;
  }

  data(data: T): this {
    this.response.data = data;
    return this;
  }

  error(error: string): this {
    this.response.error = error;
    return this;
  }

  message(message: string): this {
    this.response.message = message;
    return this;
  }

  success(data?: T, message?: string): this {
    this.response.status = 200;
    if (data !== undefined) this.response.data = data;
    if (message) this.response.message = message;
    return this;
  }

  created(data?: T, message?: string): this {
    this.response.status = 201;
    if (data !== undefined) this.response.data = data;
    if (message) this.response.message = message;
    return this;
  }

  noContent(): this {
    this.response.status = 204;
    return this;
  }

  badRequest(error?: string): this {
    this.response.status = 400;
    if (error) this.response.error = error;
    return this;
  }

  unauthorized(error?: string): this {
    this.response.status = 401;
    if (error) this.response.error = error;
    return this;
  }

  forbidden(error?: string): this {
    this.response.status = 403;
    if (error) this.response.error = error;
    return this;
  }

  notFound(error?: string): this {
    this.response.status = 404;
    if (error) this.response.error = error;
    return this;
  }

  conflict(error?: string): this {
    this.response.status = 409;
    if (error) this.response.error = error;
    return this;
  }

  internalServerError(error?: string): this {
    this.response.status = 500;
    if (error) this.response.error = error;
    return this;
  }

  build(): ApiResponse<T> {
    return { ...this.response };
  }

  send(): ApiResponse<T> {
    return this.build();
  }
}
