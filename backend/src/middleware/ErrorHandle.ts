import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ApiError } from "../model/exceptions/ApiError";

export default class ErrorHandler {
  static handle = (): ErrorRequestHandler => {
    return async (
      err: ApiError,
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {

        const statusCode = err.statusCode || 500;
        res.status(statusCode).send({
          success: false,
          message: err.message,
          path: req.path,
        });
      } catch (error) {
        res.status(500).json({
          message:
            error instanceof Error ? error.message : "Erro interno do servidor",
        });
      }
    };
  };
}