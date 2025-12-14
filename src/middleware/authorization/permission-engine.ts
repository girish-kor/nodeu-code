import { Middleware, AuthorizationError } from "../../types";

export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface PermissionConfig {
  permissions: Record<string, Permission[]>;
  evaluateCondition?: (condition: Record<string, any>, context: any) => boolean;
}

export class PermissionEngine implements Middleware {
  constructor(private config: PermissionConfig) {}

  async handle(req: any, res: any, next: () => Promise<void>): Promise<void> {
    const user = req.user;
    if (!user) {
      throw new AuthorizationError("User not authenticated");
    }

    const requiredPermissions = this.extractRequiredPermissions(req);
    if (requiredPermissions.length === 0) {
      await next();
      return;
    }

    const userPermissions = user.permissions || [];
    const hasAccess = requiredPermissions.every((permission) =>
      this.hasPermission(userPermissions, permission, req),
    );

    if (!hasAccess) {
      throw new AuthorizationError("Insufficient permissions");
    }

    await next();
  }

  private extractRequiredPermissions(req: any): Permission[] {
    return req.requiredPermissions || [];
  }

  private hasPermission(
    userPermissions: string[],
    requiredPermission: Permission,
    context: any,
  ): boolean {
    const permissionKey = `${requiredPermission.resource}:${requiredPermission.action}`;

    if (!userPermissions.includes(permissionKey)) {
      return false;
    }

    if (requiredPermission.conditions && this.config.evaluateCondition) {
      return this.config.evaluateCondition(
        requiredPermission.conditions,
        context,
      );
    }

    return true;
  }

  static createMiddleware(requiredPermissions: Permission[]): Middleware {
    return {
      handle: async (req: any, res: any, next: () => Promise<void>) => {
        req.requiredPermissions = requiredPermissions;
        await next();
      },
    };
  }

  static withPermissions(...permissions: Permission[]): Middleware {
    return PermissionEngine.createMiddleware(permissions);
  }

  checkPermission(
    userPermissions: string[],
    permission: Permission,
    context?: any,
  ): boolean {
    return this.hasPermission(userPermissions, permission, context || {});
  }

  checkAnyPermission(
    userPermissions: string[],
    permissions: Permission[],
    context?: any,
  ): boolean {
    return permissions.some((perm) =>
      this.checkPermission(userPermissions, perm, context),
    );
  }

  checkAllPermissions(
    userPermissions: string[],
    permissions: Permission[],
    context?: any,
  ): boolean {
    return permissions.every((perm) =>
      this.checkPermission(userPermissions, perm, context),
    );
  }

  static permission(
    resource: string,
    action: string,
    conditions?: Record<string, any>,
  ): Permission {
    return { resource, action, conditions };
  }

  static read(resource: string, conditions?: Record<string, any>): Permission {
    return this.permission(resource, "read", conditions);
  }

  static write(resource: string, conditions?: Record<string, any>): Permission {
    return this.permission(resource, "write", conditions);
  }

  static delete(
    resource: string,
    conditions?: Record<string, any>,
  ): Permission {
    return this.permission(resource, "delete", conditions);
  }

  static update(
    resource: string,
    conditions?: Record<string, any>,
  ): Permission {
    return this.permission(resource, "update", conditions);
  }

  static create(
    resource: string,
    conditions?: Record<string, any>,
  ): Permission {
    return this.permission(resource, "create", conditions);
  }
}
