import { Middleware, BaseError } from "../../types";

export class ErrorHandler implements Middleware {
  constructor(private logErrors = true) {}

  async handle(req: any, res: any, next: () => Promise<void>): Promise<void> {
    try {
      await next();
    } catch (error) {
      if (this.logErrors) {
        console.error("Error caught by ErrorHandler:", error);
      }

      let status = 500;
      let message = "Internal server error";

      if (error instanceof BaseError) {
        status = error.statusCode;
        message = error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      res.status(status).json({
        error: message,
        ...(process.env.NODE_ENV === "development" &&
          error instanceof Error && { stack: error.stack }),
      });
    }
  }

  catch(error: Error): { status: number; message: string; details?: any } {
    if (error instanceof BaseError) {
      return {
        status: error.statusCode,
        message: error.message,
        details: error.details,
      };
    }
    return { status: 500, message: "Internal server error" };
  }
}
