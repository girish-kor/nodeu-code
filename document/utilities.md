# Utilities

[ [Types](types.md) | [HTTP](http.md) | [Middleware](middleware.md) | [Service](service.md) | [Adapters](adapters.md) | [Utilities](utilities.md) ]

The utilities layer provides common helper functions for data manipulation, validation, and transformation. These are pure functions that can be used across the application.

## Data Manipulation

### paginate
Paginates an array of items with metadata.

```javascript
const result = paginate(users, 2, 10);
// Returns { data: User[], pagination: { page: 2, limit: 10, total: 50, pages: 5 } }
```

### sort
Sorts an array by a specific field.

```javascript
const sortedUsers = sort(users, "name", "asc");
```

### filterBySchema
Filters object properties based on a validation schema.

```javascript
const filtered = filterBySchema(input, { name: (v) => typeof v === "string" });
```

## Security & Validation

### sanitizeHtml
Sanitizes HTML input to prevent XSS attacks.

```javascript
const safeHtml = sanitizeHtml(userInput);
```

### validateEmail
Validates email address format.

```javascript
if (validateEmail(email)) {
  // Valid email
}
```

### hashPassword
Hashes passwords using SHA-256.

```javascript
const hashed = await hashPassword("password123");
```

## Type Guards & Transformation

### isType
Type guard for non-null values.

```javascript
if (isType(value)) {
  // value is not null or undefined
}
```

### transformResponse
Transforms response data by removing null/undefined values.

```javascript
const cleanResponse = transformResponse(apiData);
```