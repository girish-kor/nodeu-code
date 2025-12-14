import { Middleware } from "../../types";

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export class RateLimiter implements Middleware {
  private requests = new Map<string, { count: number; resetTime: number }>();

  constructor(private config: RateLimitConfig) {}

  async handle(req: any, res: any, next: () => Promise<void>): Promise<void> {
    const key = this.getKey(req);
    const now = Date.now();
    const windowData = this.requests.get(key);

    if (!windowData || now > windowData.resetTime) {
      this.requests.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
    } else {
      if (windowData.count >= this.config.maxRequests) {
        res.status(429).json({
          error: "Too many requests",
          retryAfter: Math.ceil((windowData.resetTime - now) / 1000),
        });
        return;
      }
      windowData.count++;
    }

    await next();

    if (Math.random() < 0.01) {
      this.cleanup();
    }
  }

  private getKey(req: any): string {
    return req.ip || req.connection.remoteAddress || "unknown";
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, data] of this.requests.entries()) {
      if (now > data.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}
