import { Middleware, ValidationResult, ValidationError } from "../../types";

export interface SchemaValidatorConfig<T = any> {
  schema: any;
  validator: "joi" | "yup" | "zod" | "custom";
  validateFunction?: (data: any, schema: any) => ValidationResult<T>;
}

export class SchemaValidator<T = any> implements Middleware {
  constructor(private config: SchemaValidatorConfig<T>) {}

  async handle(req: any, res: any, next: () => Promise<void>): Promise<void> {
    const dataToValidate = this.extractDataToValidate(req);
    const result = await this.validate(dataToValidate);

    if (!result.valid) {
      throw new ValidationError("Validation failed", result.errors);
    }

    if (result.data !== undefined) {
      this.attachValidatedData(req, result.data);
    }
    await next();
  }

  async validate(data: any): Promise<ValidationResult<T>> {
    try {
      switch (this.config.validator) {
        case "joi":
          return this.validateWithJoi(data);
        case "yup":
          return this.validateWithYup(data);
        case "zod":
          return this.validateWithZod(data);
        case "custom":
          return this.config.validateFunction!(data, this.config.schema);
        default:
          throw new Error(`Unsupported validator: ${this.config.validator}`);
      }
    } catch (error: any) {
      return {
        valid: false,
        errors: [error.message || "Validation error"],
      };
    }
  }

  private validateWithJoi(data: any): ValidationResult<T> {
    const result = this.config.schema.validate(data, { abortEarly: false });
    if (result.error) {
      return {
        valid: false,
        errors: result.error.details.map((detail: any) => detail.message),
      };
    }
    return {
      valid: true,
      data: result.value,
    };
  }

  private async validateWithYup(data: any): Promise<ValidationResult<T>> {
    try {
      const validatedData = await this.config.schema.validate(data, {
        abortEarly: false,
      });
      return {
        valid: true,
        data: validatedData,
      };
    } catch (error: any) {
      return {
        valid: false,
        errors: error.errors || [error.message],
      };
    }
  }

  private validateWithZod(data: any): ValidationResult<T> {
    const result = this.config.schema.safeParse(data);
    if (!result.success) {
      return {
        valid: false,
        errors: result.error.errors.map((err: any) => err.message),
      };
    }
    return {
      valid: true,
      data: result.data,
    };
  }

  private extractDataToValidate(req: any): any {
    return req.body;
  }

  private attachValidatedData(req: any, data: T): void {
    req.validatedData = data;
  }

  static joi<T>(schema: any): SchemaValidator<T> {
    return new SchemaValidator<T>({
      schema,
      validator: "joi",
    });
  }

  static yup<T>(schema: any): SchemaValidator<T> {
    return new SchemaValidator<T>({
      schema,
      validator: "yup",
    });
  }

  static zod<T>(schema: any): SchemaValidator<T> {
    return new SchemaValidator<T>({
      schema,
      validator: "zod",
    });
  }

  static custom<T>(
    schema: any,
    validateFunction: (data: any, schema: any) => ValidationResult<T>,
  ): SchemaValidator<T> {
    return new SchemaValidator<T>({
      schema,
      validator: "custom",
      validateFunction,
    });
  }
}
