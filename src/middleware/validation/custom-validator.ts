import { Middleware, ValidationResult, ValidationError } from "../../types";

export interface Validator<T = any> {
  validate(data: any): ValidationResult<T>;
}

export class CustomValidator<T> implements Middleware {
  constructor(private validators: Array<(data: any) => ValidationResult<T>>) {}

  async handle(req: any, res: any, next: () => Promise<void>): Promise<void> {
    const errors: string[] = [];

    for (const validator of this.validators) {
      const result = validator(req.body);
      if (!result.valid) {
        errors.push(...(result.errors || []));
      }
    }

    if (errors.length > 0) {
      throw new ValidationError("Validation failed", errors);
    }

    await next();
  }

  validate(data: any): ValidationResult<T> {
    const errors: string[] = [];

    for (const validator of this.validators) {
      const result = validator(data);
      if (!result.valid) {
        errors.push(...(result.errors || []));
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      data: errors.length === 0 ? data : undefined,
    };
  }
}
