import { body } from "express-validator";

export const createRoleValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Role name is required"),

  body("label")
    .trim()
    .notEmpty()
    .withMessage("Role label is required"),
];

export const updateRoleValidator = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Role name cannot be empty"),

  body("label")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Role label cannot be empty"),

  body("description")
    .optional()
    .trim(),
];
