import { Middleware, AuthUser, AuthenticationError } from "../../types";

export interface SessionConfig {
  sessionStore: SessionStore;
  cookieName?: string;
  maxAge?: number;
  secure?: boolean;
  httpOnly?: boolean;
}

export interface SessionStore {
  get(sessionId: string): Promise<SessionData | null>;
  set(sessionId: string, data: SessionData, ttl?: number): Promise<void>;
  delete(sessionId: string): Promise<void>;
  regenerate(sessionId: string): Promise<string>;
}

export interface SessionData {
  userId: string | number;
  user?: AuthUser;
  createdAt: Date;
  lastActivity: Date;
  data?: Record<string, any>;
}

export class SessionHandler implements Middleware {
  constructor(private config: SessionConfig) {
    this.config.cookieName = this.config.cookieName || "sessionId";
    this.config.maxAge = this.config.maxAge || 24 * 60 * 60 * 1000;
    this.config.secure = this.config.secure ?? true;
    this.config.httpOnly = this.config.httpOnly ?? true;
  }

  async handle(req: any, res: any, next: () => Promise<void>): Promise<void> {
    const sessionId = this.extractSessionId(req);

    if (!sessionId) {
      throw new AuthenticationError("No session found");
    }

    const sessionData = await this.config.sessionStore.get(sessionId);
    if (!sessionData) {
      throw new AuthenticationError("Invalid session");
    }

    const now = new Date();
    const maxAge = this.config.maxAge!;
    if (now.getTime() - sessionData.lastActivity.getTime() > maxAge) {
      await this.config.sessionStore.delete(sessionId);
      throw new AuthenticationError("Session expired");
    }

    sessionData.lastActivity = now;
    await this.config.sessionStore.set(sessionId, sessionData);

    req.user = sessionData.user || { id: sessionData.userId };
    req.sessionId = sessionId;
    req.sessionData = sessionData;

    await next();
  }

  private extractSessionId(req: any): string | null {
    const cookieValue = req.cookies?.[this.config.cookieName!];
    if (cookieValue) {
      return cookieValue;
    }

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Session ")) {
      return authHeader.substring(8);
    }

    return null;
  }

  async createSession(
    user: AuthUser,
    data?: Record<string, any>,
  ): Promise<string> {
    const sessionId = this.generateSessionId();
    const sessionData: SessionData = {
      userId: user.id,
      user,
      createdAt: new Date(),
      lastActivity: new Date(),
      data,
    };

    await this.config.sessionStore.set(
      sessionId,
      sessionData,
      this.config.maxAge! / 1000,
    );
    return sessionId;
  }

  async destroySession(sessionId: string): Promise<void> {
    await this.config.sessionStore.delete(sessionId);
  }

  async regenerateSession(sessionId: string): Promise<string> {
    const sessionData = await this.config.sessionStore.get(sessionId);
    if (!sessionData) {
      throw new Error("Session not found");
    }

    await this.config.sessionStore.delete(sessionId);
    const newSessionId = await this.config.sessionStore.regenerate(sessionId);

    sessionData.lastActivity = new Date();
    await this.config.sessionStore.set(
      newSessionId,
      sessionData,
      this.config.maxAge! / 1000,
    );

    return newSessionId;
  }

  private generateSessionId(): string {
    return require("crypto").randomBytes(32).toString("hex");
  }
}

export class MemorySessionStore implements SessionStore {
  private sessions = new Map<string, { data: SessionData; expiry: number }>();

  async get(sessionId: string): Promise<SessionData | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    if (Date.now() > session.expiry) {
      this.sessions.delete(sessionId);
      return null;
    }

    return session.data;
  }

  async set(
    sessionId: string,
    data: SessionData,
    ttl: number = 86400,
  ): Promise<void> {
    this.sessions.set(sessionId, {
      data,
      expiry: Date.now() + ttl * 1000,
    });
  }

  async delete(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  async regenerate(sessionId: string): Promise<string> {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.sessions.delete(sessionId);
    }
    const newId = require("crypto").randomBytes(32).toString("hex");
    if (session) {
      this.sessions.set(newId, session);
    }
    return newId;
  }
}
