# HTTP

[ [Types](types.md) | [HTTP](http.md) | [Middleware](middleware.md) | [Service](service.md) | [Adapters](adapters.md) | [Utilities](utilities.md) | [Index](README.md) ]

The HTTP layer provides abstractions for handling HTTP requests, building responses, registering controllers, building routes, and extracting path parameters. This layer reduces boilerplate code in web application development by offering type-safe, modular components.

## RequestHandler

`RequestHandler<T extends BaseEntity>` is an abstract base class for handling HTTP requests. It provides a structured way to process requests with built-in support for parameters, query strings, body, user authentication, and service injection.

### Key Features:
- Fluent setters for request data (`setParams`, `setQuery`, `setBody`, `setUser`, `setService`)
- Predefined response methods (`ok`, `created`, `badRequest`, etc.)
- Abstract `execute` method that must be implemented by subclasses

### Usage Example:
```javascript
class GetUserHandler extends RequestHandler {
  async execute() {
    const userId = this.params.id;
    const user = await this.service.findById(userId);
    return this.ok(user);
  }
}
```

## ResponseBuilder

`ResponseBuilder<T>` is a fluent builder for constructing API responses. It simplifies creating consistent response objects with status codes, data, errors, and messages.

### Key Features:
- Chainable methods for setting response properties
- Predefined methods for common HTTP status codes
- `build()` and `send()` methods to finalize the response

### Usage Example:
```javascript
const response = new ResponseBuilder()
  .success(user, "User retrieved successfully")
  .build();
```

## ControllerRegistry

`ControllerRegistry` manages the registration of controllers and aggregates their routes. It allows for modular controller organization and centralized route collection.

### Key Features:
- Register controllers with optional base paths
- Collect all routes from registered controllers
- Utility methods for route management

### Usage Example:
```javascript
const registry = new ControllerRegistry();
registry.register(new UserController(), "/api/users");
const routes = registry.getAllRoutes();
```

## RouteBuilder

`RouteBuilder<T extends BaseEntity>` provides a fluent interface for defining routes with different HTTP methods. It supports middleware attachment to routes.

### Key Features:
- Methods for all standard HTTP verbs (GET, POST, PUT, DELETE, PATCH)
- Middleware support per route
- `build()` method to retrieve defined routes

### Usage Example:
```javascript
const routes = new RouteBuilder()
  .get("/users", getUsersHandler, [authMiddleware])
  .post("/users", createUserHandler)
  .build();
```

## PathParamExtractor

`PathParamExtractor` handles extraction of path parameters from route patterns. It uses regex to parse parameterized paths and extract values.

### Key Features:
- Extract parameter names from path patterns
- Extract parameter values from actual paths
- Validate path patterns

### Usage Example:
```javascript
const extractor = new PathParamExtractor();
const params = extractor.extractWithValues("/users/:id/posts/:postId", "/users/123/posts/456");
// Result: { id: "123", postId: "456" }
```