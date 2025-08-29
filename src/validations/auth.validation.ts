import Joi from "joi";
import { UserEnum } from "@/types/enums/user.enum";
import { Regex } from "@/utils/regex";

export const registerSchema = Joi.object({
  firstName: Joi.string()
    .min(UserEnum.FIRST_NAME_MIN)
    .max(UserEnum.FIRST_NAME_MAX)
    .required()
    .trim()
    .messages({
      "string.min": `First name should contain at least ${UserEnum.FIRST_NAME_MIN} characters`,
      "string.max": `First name cannot exceed ${UserEnum.FIRST_NAME_MAX} characters`,
      "any.required": "First name is required",
    }),

  middleName: Joi.string()
    .min(UserEnum.MIDDLE_NAME_MIN)
    .max(UserEnum.MIDDLE_NAME_MAX)
    .optional()
    .trim()
    .allow("")
    .messages({
      "string.min": `Middle name should contain at least ${UserEnum.MIDDLE_NAME_MIN} characters`,
      "string.max": `Middle name cannot exceed ${UserEnum.MIDDLE_NAME_MAX} characters`,
    }),

  lastName: Joi.string()
    .min(UserEnum.LAST_NAME_MIN)
    .max(UserEnum.LAST_NAME_MAX)
    .required()
    .trim()
    .messages({
      "string.min": `Last name should contain at least ${UserEnum.LAST_NAME_MIN} characters`,
      "string.max": `Last name cannot exceed ${UserEnum.LAST_NAME_MAX} characters`,
      "any.required": "Last name is required",
    }),

  phoneNumber: Joi.string()
    .min(UserEnum.PHONE_MIN)
    .required()
    .trim()
    .messages({
      "string.min": `Phone number must at least have ${UserEnum.PHONE_MIN} digits`,
      "any.required": "Phone number is required",
    }),

  employeeId: Joi.string()
    .min(UserEnum.EMPLOYEE_ID_MIN)
    .required()
    .trim()
    .messages({
      "string.min": `Employee ID must at least have ${UserEnum.EMPLOYEE_ID_MIN} digits`,
      "any.required": "Employee ID is required",
    }),

  email: Joi.string()
    .email()
    .pattern(Regex.EMAIL_PATTERN)
    .required()
    .lowercase()
    .trim()
    .messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),

  password: Joi.string().min(8).required().messages({
    "string.min": "Password must not be less than 8 characters",
    "any.required": "Password is required",
  }),
});

export const loginSchema = Joi.object({
  employeeId: Joi.string().required().trim().messages({
    "any.required": "Employee ID is required",
  }),

  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    "any.required": "Old password is required",
  }),

  newPassword: Joi.string().min(8).required().messages({
    "string.min": "New password must not be less than 8 characters",
    "any.required": "New password is required",
  }),
});

export const updateProfileSchema = Joi.object({
  firstName: Joi.string()
    .min(UserEnum.FIRST_NAME_MIN)
    .max(UserEnum.FIRST_NAME_MAX)
    .optional()
    .trim(),

  middleName: Joi.string()
    .min(UserEnum.MIDDLE_NAME_MIN)
    .max(UserEnum.MIDDLE_NAME_MAX)
    .optional()
    .trim()
    .allow(""),

  lastName: Joi.string()
    .min(UserEnum.LAST_NAME_MIN)
    .max(UserEnum.LAST_NAME_MAX)
    .optional()
    .trim(),

  email: Joi.string()
    .email()
    .pattern(Regex.EMAIL_PATTERN)
    .optional()
    .lowercase()
    .trim(),
});
