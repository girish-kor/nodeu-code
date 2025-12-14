# Service

[ [Types](types.md) | [HTTP](http.md) | [Middleware](middleware.md) | [Service](service.md) | [Adapters](adapters.md) | [Utilities](utilities.md) ]

The service layer contains business logic abstractions and supporting utilities like caching, event handling, and job processing.

## BaseService

`BaseService<T extends BaseEntity>` is an abstract base class that provides common CRUD operations for entities. It delegates to a repository for data access.

### Key Features:
- Standard CRUD methods (create, findById, update, delete)
- List and count operations with options
- Repository abstraction

### Usage Example:
```javascript
class UserService extends BaseService {
  constructor(repository) {
    super(repository);
  }

  async findByEmail(email) {
    return this.repository.findByEmail(email);
  }
}
```

## CacheManager

`CacheManager<K, V>` provides in-memory caching with time-to-live (TTL) support. It is useful for caching expensive operations or frequently accessed data.

### Key Features:
- TTL-based expiration
- Type-safe key-value storage
- Automatic cleanup of expired entries

### Usage Example:
```javascript
const cache = new CacheManager();
await cache.set("user:123", user, 3600); // Cache for 1 hour
const cachedUser = await cache.get("user:123");
```

## EventEmitter

`EventEmitter` implements a simple publish-subscribe pattern for decoupling components. It supports async event handlers.

### Key Features:
- Async event emission
- Multiple listeners per event
- Listener management (add, remove, count)

### Usage Example:
```javascript
const emitter = new EventEmitter();
emitter.on("user.created", async (user) => {
  await sendWelcomeEmail(user);
});
await emitter.emit("user.created", newUser);
```

## JobQueue

`JobQueue` provides a simple in-memory job queue for background processing. It is suitable for lightweight asynchronous tasks.

### Key Features:
- Job enqueueing with unique IDs
- Sequential processing
- Error handling and logging

### Usage Example:
```javascript
const queue = new JobQueue();
const jobId = await queue.enqueue({
  type: "send-email",
  data: { to: "user@example.com", subject: "Welcome" }
});
```