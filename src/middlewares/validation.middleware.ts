import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";
import { ApiResponse } from "@/types";
import { HTTP_STATUS } from "@/constants/constants";
import { createResponse } from "@/utils/response";

export const validate = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      const response: ApiResponse = createResponse(
        false,
        "Validation error",
        errorMessages
      );

      res.status(HTTP_STATUS.BAD_REQUEST).json(response);
      return;
    }

    next();
  };
};
