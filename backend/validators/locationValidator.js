import { body } from "express-validator";

export const createLocationValidator = [
  body("domain")
    .trim()
    .notEmpty()
    .withMessage("Domain is required"),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Location name is required"),

  body("sublocations")
    .isArray()
    .withMessage("Sublocations must be an array"),
];

export const updateLocationValidator = [
  body("domain").optional().trim(),
  body("name").optional().trim(),
  body("sublocations").optional().isArray(),
];
