export class PathParamExtractor {
  private paramRegex = /:([a-zA-Z_][a-zA-Z0-9_.-]*)/g;

  extract(pathPattern: string): string[] {
    const params: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = this.paramRegex.exec(pathPattern)) !== null) {
      params.push(match[1]);
    }

    return params;
  }

  extractWithValues(
    pathPattern: string,
    actualPath: string,
  ): Record<string, string> {
    const params = this.extract(pathPattern);
    const result: Record<string, string> = {};

    if (params.length === 0) {
      return result;
    }

    const regexPattern = pathPattern.replace(this.paramRegex, "([^/]+)");
    const regex = new RegExp(`^${regexPattern}$`);
    const match = actualPath.match(regex);

    if (match) {
      params.forEach((param, index) => {
        result[param] = match[index + 1];
      });
    }

    return result;
  }

  validatePath(pathPattern: string): boolean {
    try {
      new RegExp(`^${pathPattern.replace(this.paramRegex, "([^/]+)")}$`);
      return true;
    } catch {
      return false;
    }
  }
}
