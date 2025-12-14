export interface BaseEntity {
  id: string | number;
}

export interface ApiResponse<T = any> {
  status: number;

  data?: T;

  error?: string;

  message?: string;
}

export interface Request<T = any> {
  params: Record<string, any>;

  query: Record<string, any>;

  body: T;

  headers: Record<string, string>;

  user?: AuthUser;
}

export interface Response<T = any> {
  status: number;

  data?: T;

  error?: string;

  message?: string;
}

export interface AuthUser {
  id: string | number;

  email?: string;

  roles?: string[];

  permissions?: string[];
}

export interface ValidationResult<T = any> {
  valid: boolean;

  data?: T;

  errors?: string[];
}

export interface QueryOptions {
  where?: Record<string, any>;

  orderBy?: Record<string, "asc" | "desc">;

  limit?: number;

  offset?: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface Middleware<T = any> {
  handle(req: T, res: any, next: () => Promise<void>): Promise<void>;
}

export interface PasswordHasher {
  hash(plain: string): Promise<string>;

  verify(plain: string, hashed: string): Promise<boolean>;
}

export interface CacheStrategy<K, V> {
  get(key: K): Promise<V | null>;

  set(key: K, value: V, ttlSeconds?: number): Promise<void>;

  delete(key: K): Promise<boolean>;

  clear(): Promise<void>;
}

export interface DatabaseConnection {
  connect(): Promise<void>;

  disconnect(): Promise<void>;

  isConnected(): boolean;
}

export interface TransactionManager {
  begin(): Promise<void>;

  commit(): Promise<void>;

  rollback(): Promise<void>;

  isActive(): boolean;
}

export interface Job {
  id: string;

  type: string;

  data: any;

  priority?: number;

  retries?: number;
}

export interface EventData {
  type: string;

  payload: any;

  timestamp: Date;
}

export interface ValidationSchema {
  validate(data: any): any;
}

export interface RouteDefinition {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

  path: string;

  handler: Function;

  middleware?: Middleware[];
}

export abstract class BaseError extends Error {
  abstract readonly statusCode: number;

  constructor(
    message: string,
    public readonly details?: any,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends BaseError {
  readonly statusCode = 400;

  constructor(message: string = "Validation error", details?: any) {
    super(message, details);
  }
}

export class AuthenticationError extends BaseError {
  readonly statusCode = 401;

  constructor(message: string = "Authentication required", details?: any) {
    super(message, details);
  }
}

export class AuthorizationError extends BaseError {
  readonly statusCode = 403;

  constructor(message: string = "Access denied", details?: any) {
    super(message, details);
  }
}

export class NotFoundError extends BaseError {
  readonly statusCode = 404;

  constructor(message: string = "Resource not found", details?: any) {
    super(message, details);
  }
}

export class ConflictError extends BaseError {
  readonly statusCode = 409;

  constructor(message: string = "Resource conflict", details?: any) {
    super(message, details);
  }
}

export class InternalServerError extends BaseError {
  readonly statusCode = 500;

  constructor(message: string = "Internal server error", details?: any) {
    super(message, details);
  }
}
