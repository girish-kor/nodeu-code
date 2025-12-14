# Adapters

[ [Types](types.md) | [HTTP](http.md) | [Middleware](middleware.md) | [Service](service.md) | [Adapters](adapters.md) | [Utilities](utilities.md) | [Index](README.md) ]

The adapters layer provides data access abstractions and database-related utilities. These components abstract away the specifics of data storage and retrieval.

## Repository

`Repository<T extends BaseEntity>` is an abstract base class for data access. It defines the interface for CRUD operations.

### Key Features:
- Abstract methods for all CRUD operations
- Query options support
- InMemoryRepository implementation for testing

### Usage Example:
```javascript
class UserRepository extends Repository {
  async create(data) {
    // Implementation for specific database
  }
}
```

## QueryBuilder

`QueryBuilder<T>` provides a fluent interface for building database queries. It constructs query options that can be used with repositories.

### Key Features:
- Chainable where, orderBy, limit, offset methods
- Type-safe field references
- Reset functionality

### Usage Example:
```javascript
const query = new QueryBuilder()
  .where("age", ">", 18)
  .orderBy("name", "asc")
  .limit(10)
  .build();
```

## Transaction

`Transaction` abstracts database transactions. It provides methods for beginning, committing, and rolling back transactions.

### Key Features:
- Abstract transaction interface
- InMemoryTransaction for testing
- Automatic rollback on errors

### Usage Example:
```javascript
await transaction.run(async () => {
  await userRepo.create(userData);
  await profileRepo.create(profileData);
});
```

## ConnectionPool

`ConnectionPool` manages database connections efficiently. It handles connection lifecycle and pooling.

### Key Features:
- Abstract connection pool interface
- Connection statistics
- MockConnectionPool for testing

### Usage Example:
```javascript
const pool = new MySQLConnectionPool(config);
const connection = await pool.getConnection();
// Use connection
await pool.releaseConnection(connection);
```

## MigrationRunner

`MigrationRunner` handles database schema migrations. It tracks executed migrations and supports rollbacks.

### Key Features:
- Migration registration
- Pending migration execution
- Rollback support

### Usage Example:
```javascript
const runner = new MigrationRunner();
runner.addMigration({
  id: "001",
  name: "Create users table",
  up: async () => { /* SQL */ },
  down: async () => { /* SQL */ }
});
await runner.runPending();
```