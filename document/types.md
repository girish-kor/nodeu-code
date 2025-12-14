# Types

[ [HTTP](http.md) | [Middleware](middleware.md) | [Service](service.md) | [Adapters](adapters.md) | [Utilities](utilities.md) | [Index](README.md) ]

The types layer defines TypeScript interfaces and classes used throughout the package. These provide type safety and consistency across all layers.

## Core Types

### BaseEntity
Base interface for all entities with an ID.

```typescript
interface BaseEntity {
  id: string | number;
}
```

### ApiResponse
Standard API response structure.

```typescript
interface ApiResponse<T = any> {
  status: number;
  data?: T;
  error?: string;
  message?: string;
}
```

### AuthUser
User information for authenticated requests.

```typescript
interface AuthUser {
  id: string | number;
  email?: string;
  roles?: string[];
  permissions?: string[];
}
```

## Data Access Types

### QueryOptions
Options for database queries.

```typescript
interface QueryOptions {
  where?: Record<string, any>;
  orderBy?: Record<string, "asc" | "desc">;
  limit?: number;
  offset?: number;
}
```

### PaginationResult
Result of paginated queries.

```typescript
interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
```

## Middleware & Routing

### Middleware
Interface for middleware functions.

```typescript
interface Middleware<T = any> {
  handle(req: T, res: any, next: () => Promise<void>): Promise<void>;
}
```

### RouteDefinition
Definition of a route with method, path, handler, and middleware.

```typescript
interface RouteDefinition {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  handler: Function;
  middleware?: Middleware[];
}
```

## Error Classes

Custom error classes that extend `BaseError` with appropriate HTTP status codes:

- `ValidationError` (400)
- `AuthenticationError` (401)
- `AuthorizationError` (403)
- `NotFoundError` (404)
- `ConflictError` (409)
- `InternalServerError` (500)

### Usage Example:
```typescript
throw new ValidationError("Invalid input", { field: "email" });
```

## Other Interfaces

- `PasswordHasher`: For password hashing strategies
- `CacheStrategy`: For different caching implementations
- `DatabaseConnection`: For database connection management
- `TransactionManager`: For transaction handling
- `Job`: For background job definitions
- `EventData`: For event payload structure
- `ValidationSchema`: For validation schemas