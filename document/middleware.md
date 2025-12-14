# Middleware

[ [Types](types.md) | [HTTP](http.md) | [Middleware](middleware.md) | [Service](service.md) | [Adapters](adapters.md) | [Utilities](utilities.md)]

The middleware layer provides reusable components for authentication, authorization, validation, and cross-cutting concerns. These middlewares can be attached to routes to handle common web application requirements.

## Authentication

### JWTHandler

`JWTHandler` implements JSON Web Token authentication. It verifies Bearer tokens in request headers and attaches user information to the request.

#### Key Features:
- Token signing and verification
- Configurable algorithms and expiration
- Automatic token decoding

#### Usage Example:
```javascript
const jwtHandler = new JWTHandler({ secret: "my-secret" });
app.use(jwtHandler.handle.bind(jwtHandler));
```

### OAuthHandler

Handles OAuth 2.0 authentication flows.

### APIKeyHandler

Validates API keys for authentication.

### SessionHandler

Manages session-based authentication.

## Authorization

### RoleBasedAccess

`RoleBasedAccess` enforces role-based access control. It checks if authenticated users have the required roles for accessing resources.

#### Key Features:
- Role hierarchy support
- Static methods for creating role-checking middleware
- Permission aggregation from roles

#### Usage Example:
```javascript
const rbac = new RoleBasedAccess({
  roles: { admin: ["read", "write"], user: ["read"] }
});
app.use(rbac.handle.bind(rbac));
```

### PermissionEngine

Manages fine-grained permissions beyond roles.

## Validation

### SchemaValidator

`SchemaValidator` validates request data against schemas using popular validation libraries (Joi, Yup, Zod) or custom functions.

#### Key Features:
- Support for multiple validation libraries
- Automatic error handling
- Validated data attachment to request

#### Usage Example:
```javascript
const validator = SchemaValidator.joi(userSchema);
app.use(validator.handle.bind(validator));
```

### CustomValidator

Allows custom validation logic.

## Cross-Cutting

### ErrorHandler

`ErrorHandler` catches and handles errors thrown during request processing, providing consistent error responses.

#### Key Features:
- Automatic error logging
- Status code mapping for custom errors
- Development mode stack traces

#### Usage Example:
```javascript
const errorHandler = new ErrorHandler();
app.use(errorHandler.handle.bind(errorHandler));
```

### RateLimiter

`RateLimiter` implements rate limiting to prevent abuse and ensure fair resource usage.

#### Key Features:
- Configurable request limits and windows
- IP-based tracking
- Automatic cleanup of expired entries

#### Usage Example:
```javascript
const rateLimiter = new RateLimiter({ windowMs: 60000, maxRequests: 100 });
app.use(rateLimiter.handle.bind(rateLimiter));
```