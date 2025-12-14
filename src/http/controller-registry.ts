import { RouteDefinition } from "../types";

export class ControllerRegistry {
  private routes: RouteDefinition[] = [];

  register(controller: any, basePath: string = ""): this {
    if (typeof controller.getRoutes === "function") {
      const controllerRoutes = controller.getRoutes();
      controllerRoutes.forEach((route: RouteDefinition) => {
        this.routes.push({
          ...route,
          path: basePath + route.path,
        });
      });
    }
    return this;
  }

  getAllRoutes(): RouteDefinition[] {
    return [...this.routes];
  }

  clear(): void {
    this.routes = [];
  }

  getRoutesCount(): number {
    return this.routes.length;
  }
}
