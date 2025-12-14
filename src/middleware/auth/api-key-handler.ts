import { Middleware, AuthUser, AuthenticationError } from "../../types";

export interface APIKeyConfig {
  headerName?: string;
  queryParamName?: string;
  validateKey: (key: string) => Promise<boolean> | boolean;
  getUserFromKey?: (key: string) => Promise<AuthUser | null>;
}

export class APIKeyHandler implements Middleware {
  constructor(private config: APIKeyConfig) {
    this.config.headerName = this.config.headerName || "X-API-Key";
    this.config.queryParamName = this.config.queryParamName || "api_key";
  }

  async handle(req: any, res: any, next: () => Promise<void>): Promise<void> {
    const apiKey = this.extractApiKey(req);

    if (!apiKey) {
      throw new AuthenticationError("Missing API key");
    }

    const isValid = await this.config.validateKey(apiKey);
    if (!isValid) {
      throw new AuthenticationError("Invalid API key");
    }

    if (this.config.getUserFromKey) {
      const user = await this.config.getUserFromKey(apiKey);
      if (user) {
        req.user = user;
      }
    }

    await next();
  }

  private extractApiKey(req: any): string | null {
    const headerKey = req.headers[this.config.headerName!.toLowerCase()];
    if (headerKey) {
      return Array.isArray(headerKey) ? headerKey[0] : headerKey;
    }

    const queryKey = req.query[this.config.queryParamName!];
    if (queryKey) {
      return Array.isArray(queryKey) ? queryKey[0] : queryKey;
    }

    return null;
  }

  static createSimpleValidator(validKeys: string[]): (key: string) => boolean {
    const keySet = new Set(validKeys);
    return (key: string) => keySet.has(key);
  }

  static createDatabaseValidator(
    findKey: (
      key: string,
    ) => Promise<{ userId: string | number; permissions?: string[] } | null>,
  ): APIKeyConfig {
    return {
      validateKey: async (key: string) => {
        const result = await findKey(key);
        return result !== null;
      },
      getUserFromKey: async (key: string) => {
        const result = await findKey(key);
        if (!result) return null;

        return {
          id: result.userId,
          permissions: result.permissions,
        };
      },
    };
  }
}
