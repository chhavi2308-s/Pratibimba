import { body } from "express-validator";

export const createDomainValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Domain name is required"),
];

export const updateDomainValidator = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Domain name cannot be empty"),
];
