import { Middleware, AuthUser, AuthenticationError } from "../../types";

export interface JWTConfig {
  secret: string;

  algorithm?: string;

  expiresIn?: string;
}

export class JWTHandler implements Middleware {
  constructor(private config: JWTConfig) {}

  async handle(req: any, res: any, next: () => Promise<void>): Promise<void> {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AuthenticationError("Missing or invalid authorization header");
    }

    const token = authHeader.substring(7);
    try {
      const payload = this.verify(token);
      req.user = payload as AuthUser;
      await next();
    } catch (error) {
      throw new AuthenticationError("Invalid token");
    }
  }

  sign(payload: object): string {
    const header = { alg: this.config.algorithm || "HS256", typ: "JWT" };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString(
      "base64url",
    );
    const now = Math.floor(Date.now() / 1000);
    const payloadWithClaims = {
      ...payload,
      iat: (payload as any).iat || now,
      exp:
        (payload as any).exp ||
        now +
          (this.config.expiresIn
            ? this.parseExpiresIn(this.config.expiresIn)
            : 3600),
    };
    const encodedPayload = Buffer.from(
      JSON.stringify(payloadWithClaims),
    ).toString("base64url");

    const data = `${encodedHeader}.${encodedPayload}`;
    const signature = this.createSignature(data, this.config.secret);
    return `${data}.${signature}`;
  }

  verify(token: string): object {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid token format");
    }

    const [header, payload, signature] = parts;
    const data = `${header}.${payload}`;
    const expectedSignature = this.createSignature(data, this.config.secret);

    if (signature !== expectedSignature) {
      throw new Error("Invalid signature");
    }

    const decodedPayload = JSON.parse(
      Buffer.from(payload, "base64url").toString(),
    );
    const now = Math.floor(Date.now() / 1000);

    if (decodedPayload.exp && decodedPayload.exp < now) {
      throw new Error("Token expired");
    }

    return decodedPayload;
  }

  decode(token: string): object {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid token format");
    }

    return JSON.parse(Buffer.from(parts[1], "base64url").toString());
  }

  private createSignature(data: string, secret: string): string {
    const crypto = require("crypto");
    return crypto.createHmac("sha256", secret).update(data).digest("base64url");
  }

  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 3600;

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case "s":
        return value;
      case "m":
        return value * 60;
      case "h":
        return value * 3600;
      case "d":
        return value * 86400;
      default:
        return 3600;
    }
  }
}
