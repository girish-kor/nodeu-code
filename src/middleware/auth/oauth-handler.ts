import { Middleware, AuthUser, AuthenticationError } from "../../types";

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scope?: string[];
}

export class OAuthHandler implements Middleware {
  constructor(private config: OAuthConfig) {}

  async handle(req: any, res: any, next: () => Promise<void>): Promise<void> {
    const code = req.query.code;
    if (!code) {
      throw new AuthenticationError("Missing authorization code");
    }

    try {
      const tokenData = await this.exchangeCodeForToken(code);
      const userInfo = await this.getUserInfo(tokenData.access_token);
      req.user = this.mapToAuthUser(userInfo);
      await next();
    } catch (error) {
      throw new AuthenticationError("OAuth authentication failed");
    }
  }

  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: "code",
      scope: (this.config.scope || ["openid", "profile", "email"]).join(" "),
    });

    if (state) {
      params.set("state", state);
    }

    return `${this.config.authorizationUrl}?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<any> {
    const response = await fetch(this.config.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: this.config.redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to exchange code for token");
    }

    return response.json();
  }

  async getUserInfo(accessToken: string): Promise<any> {
    const response = await fetch(this.config.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get user info");
    }

    return response.json();
  }

  private mapToAuthUser(userInfo: any): AuthUser {
    return {
      id: userInfo.sub || userInfo.id,
      email: userInfo.email,
    };
  }

  async refreshToken(refreshToken: string): Promise<any> {
    const response = await fetch(this.config.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    return response.json();
  }
}
