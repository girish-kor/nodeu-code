import { Middleware, AuthorizationError } from "../../types";

export interface RoleConfig {
  roles: Record<string, string[]>;
  roleHierarchy?: Record<string, string[]>;
}

export class RoleBasedAccess implements Middleware {
  constructor(private config: RoleConfig) {}

  async handle(req: any, res: any, next: () => Promise<void>): Promise<void> {
    const user = req.user;
    if (!user) {
      throw new AuthorizationError("User not authenticated");
    }

    const requiredRoles = this.extractRequiredRoles(req);
    if (requiredRoles.length === 0) {
      await next();
      return;
    }

    const userRoles = user.roles || [];
    const hasAccess = requiredRoles.some((role) =>
      this.hasRole(userRoles, role),
    );

    if (!hasAccess) {
      throw new AuthorizationError("Insufficient permissions");
    }

    await next();
  }

  private extractRequiredRoles(req: any): string[] {
    return req.requiredRoles || [];
  }

  private hasRole(userRoles: string[], requiredRole: string): boolean {
    if (userRoles.includes(requiredRole)) {
      return true;
    }

    if (this.config.roleHierarchy) {
      for (const userRole of userRoles) {
        const hierarchy = this.config.roleHierarchy[userRole] || [];
        if (hierarchy.includes(requiredRole)) {
          return true;
        }
      }
    }

    return false;
  }

  static createMiddleware(requiredRoles: string[]): Middleware {
    return {
      handle: async (req: any, res: any, next: () => Promise<void>) => {
        req.requiredRoles = requiredRoles;
        await next();
      },
    };
  }

  static withRoles(...roles: string[]): Middleware {
    return RoleBasedAccess.createMiddleware(roles);
  }

  hasAnyRole(userRoles: string[], roles: string[]): boolean {
    return roles.some((role) => this.hasRole(userRoles, role));
  }

  hasAllRoles(userRoles: string[], roles: string[]): boolean {
    return roles.every((role) => this.hasRole(userRoles, role));
  }

  getRolePermissions(role: string): string[] {
    return this.config.roles[role] || [];
  }

  getAllUserPermissions(userRoles: string[]): string[] {
    const permissions = new Set<string>();

    for (const role of userRoles) {
      const rolePerms = this.getRolePermissions(role);
      rolePerms.forEach((perm) => permissions.add(perm));

      if (this.config.roleHierarchy) {
        const hierarchy = this.config.roleHierarchy[role] || [];
        for (const parentRole of hierarchy) {
          const parentPerms = this.getRolePermissions(parentRole);
          parentPerms.forEach((perm) => permissions.add(perm));
        }
      }
    }

    return Array.from(permissions);
  }
}
