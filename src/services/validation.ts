import { AsyncValidationOptions, ObjectSchema } from "joi";
import { CustomError } from "../error";

const options: AsyncValidationOptions = {
  errors: {
    wrap: {
      label: false,
    },
  },
};

export const validateRequest = async <T>(params: T, schema: ObjectSchema<T>) => {
  try {
    await schema.validateAsync(params, options);
  } catch (err) {
    throw new CustomError((err as Error).message, 400);
  }
};
