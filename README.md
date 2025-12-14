# NodeU Code Documentation

@nodeu/code is a Node.js/TypeScript package that reduces backend development boilerplate by 80% through modular, type-safe abstractions. The package is organized into several layers, each providing specific functionality for building robust web applications.

## Benefits

- 80% Boilerplate Reduction: Pre-built abstractions for common backend patterns
- Type Safety: Full TypeScript support with comprehensive type definitions
- Modularity: Mix and match components as needed
- Testability: In-memory implementations for easy testing
- Extensibility: Abstract base classes for custom implementation

## Index

| Layer | Description |
|-------|-------------|
| [Types](document/types.md) | Core TypeScript interfaces and error classes that provide type safety across the entire package. |
| [HTTP](document/http.md) | HTTP request/response abstractions including handlers, builders, controllers, routes, and parameter extraction. |
| [Middleware](document/middleware.md) | Authentication, authorization, validation, and cross-cutting concerns middleware. |
| [Service](document/service.md) | Business logic abstractions including base services, caching, event handling, and job queues. |
| [Adapters](document/adapters.md) | Data access abstractions for repositories, queries, transactions, connections, and migrations. |
| [Utilities](document/utilities.md) | Common helper functions for data manipulation, validation, and transformation. |


## Installation

```bash
npm install @nodeu/code
```

## Quick Start

```javascript
const express = require('express');
const {
  RequestHandler,
  ResponseBuilder,
  RouteBuilder,
  ControllerRegistry,
  JWTHandler,
  SchemaValidator,
  ErrorHandler,
  BaseService,
  InMemoryRepository,
  CacheManager,
  EventEmitter,
} = require("@nodeu/code");

// 1. Define your data models
class User {
  constructor(id, name, email) {
    this.id = id;
    this.name = name;
    this.email = email;
  }
}

// 2. Create repository
class UserRepository extends InMemoryRepository {
  async findByEmail(email) {
    const users = await this.findAll();
    return users.find(user => user.email === email);
  }
}

// 3. Create service
class UserService extends BaseService {
  constructor(repository, cache, eventEmitter) {
    super(repository);
    this.cache = cache;
    this.eventEmitter = eventEmitter;
  }

  async findById(id) {
    // Check cache first
    let user = await this.cache.get(`user:${id}`);
    if (!user) {
      user = await super.findById(id);
      if (user) {
        await this.cache.set(`user:${id}`, user, 300); // Cache for 5 minutes
      }
    }
    return user;
  }

  async create(data) {
    const user = await super.create(data);
    await this.eventEmitter.emit('user.created', user);
    return user;
  }
}

// 4. Create request handlers
class GetUserHandler extends RequestHandler {
  async execute() {
    const userId = this.params.id;
    const user = await this.service.findById(userId);

    if (!user) {
      return this.notFound('User not found');
    }

    return this.ok(user);
  }
}

class CreateUserHandler extends RequestHandler {
  async execute() {
    const userData = this.body;
    const existingUser = await this.service.repository.findByEmail(userData.email);

    if (existingUser) {
      return this.conflict('User with this email already exists');
    }

    const user = await this.service.create(userData);
    return this.created(user);
  }
}

class GetUsersHandler extends RequestHandler {
  async execute() {
    const { page = 1, limit = 10 } = this.query;
    const users = await this.service.list({ offset: (page - 1) * limit, limit: parseInt(limit) });
    const total = await this.service.count();

    return this.ok({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  }
}

// 5. Set up validation schema
const createUserSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 2 },
    email: { type: 'string', format: 'email' }
  },
  required: ['name', 'email']
};

// 6. Initialize components
const app = express();
app.use(express.json());

// Initialize dependencies
const userRepository = new UserRepository();
const cacheManager = new CacheManager();
const eventEmitter = new EventEmitter();
const userService = new UserService(userRepository, cacheManager, eventEmitter);

// Set up middleware
const jwtHandler = new JWTHandler({ secret: 'your-secret-key' });
const userValidation = SchemaValidator.custom(createUserSchema, (data, schema) => {
  // Simple validation - in real app, use a proper validator
  const errors = [];
  if (!data.name || data.name.length < 2) errors.push('Name is required and must be at least 2 characters');
  if (!data.email || !data.email.includes('@')) errors.push('Valid email is required');

  return {
    valid: errors.length === 0,
    data: data,
    errors
  };
});

// Set up routes
const routeBuilder = new RouteBuilder();
routeBuilder
  .get('/users', (req, res) => {
    const handler = new GetUsersHandler();
    handler.setQuery(req.query);
    handler.setService(userService);
    return handler.execute();
  })
  .get('/users/:id', (req, res) => {
    const handler = new GetUserHandler();
    handler.setParams(req.params);
    handler.setService(userService);
    return handler.execute();
  })
  .post('/users', (req, res) => {
    const handler = new CreateUserHandler();
    handler.setBody(req.body);
    handler.setService(userService);
    return handler.execute();
  });

// Register routes with middleware
const registry = new ControllerRegistry();
registry.register({
  getRoutes: () => routeBuilder.build().map(route => ({
    ...route,
    middleware: route.path.includes('/users') && route.method === 'POST'
      ? [userValidation.handle.bind(userValidation)]
      : []
  }))
});

// Apply middleware and routes
app.use('/api', jwtHandler.handle.bind(jwtHandler));
app.use('/api', (req, res, next) => {
  // Simple route matching - in real app, use a proper router
  const routes = registry.getAllRoutes();
  const route = routes.find(r => {
    const pathRegex = new RegExp('^' + r.path.replace(/:\w+/g, '([^/]+)') + '$');
    return r.method === req.method && pathRegex.test(req.path.replace('/api', ''));
  });

  if (route) {
    // Apply route middleware
    if (route.middleware) {
      let index = 0;
      const nextMiddleware = () => {
        if (index < route.middleware.length) {
          route.middleware[index++](req, res, nextMiddleware);
        } else {
          // Execute handler
          route.handler(req, res).then(result => {
            res.status(result.status).json(result.data || { error: result.error });
          }).catch(next);
        }
      };
      nextMiddleware();
    } else {
      route.handler(req, res).then(result => {
        res.status(result.status).json(result.data || { error: result.error });
      }).catch(next);
    }
  } else {
    res.status(404).json({ error: 'Route not found' });
  }
});

// Error handling
const errorHandler = new ErrorHandler(true);
app.use(errorHandler.handle.bind(errorHandler));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Event listeners
eventEmitter.on('user.created', (user) => {
  console.log(`New user created: ${user.name} (${user.email})`);
});

module.exports = app;
```

## Authors

- [Girish Kor](https://girishkor.dev)
- [NodeU](https://github.com/girish-kor/nodeu-code)
- [Npm](https://www.npmjs.com/package/@nodeu/code)