export function paginate<T>(
  items: T[],
  page: number = 1,
  limit: number = 10,
): {
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
} {
  const offset = (page - 1) * limit;
  const data = items.slice(offset, offset + limit);
  const total = items.length;
  const pages = Math.ceil(total / limit);

  return {
    data,
    pagination: { page, limit, total, pages },
  };
}

export function sort<T>(
  items: T[],
  by: keyof T,
  order: "asc" | "desc" = "asc",
): T[] {
  return [...items].sort((a, b) => {
    const aVal = a[by];
    const bVal = b[by];

    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  });
}

export function filterBySchema<T>(data: any, schema: Record<string, any>): T {
  const filtered: any = { ...data };

  for (const [key, validator] of Object.entries(schema)) {
    if (typeof validator === "function" && !validator(data[key])) {
      delete filtered[key];
    }
  }

  return filtered as T;
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{1,}$/;
  return emailRegex.test(email) && !email.includes("..");
}

export async function hashPassword(plain: string): Promise<string> {
  const crypto = await import("crypto");
  return crypto.createHash("sha256").update(plain).digest("hex");
}

export function isType<T>(value: any): value is T {
  return value !== null && value !== undefined;
}

export function transformResponse<T>(data: any): T {
  const transformed: any = {};

  for (const [key, value] of Object.entries(data)) {
    if (value != null) {
      transformed[key] = value;
    }
  }

  return transformed as T;
}
