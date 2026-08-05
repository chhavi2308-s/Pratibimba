import { body } from "express-validator";

export const updateScheduledAuditValidator = [

  body("startDate")
    .optional(),

  body("endDate")
    .optional(),

  body("auditors")
    .optional()
    .isArray(),

  body("auditCoordinator")
    .optional()
    .trim(),

  body("status")
    .optional()
    .isIn([
      "upcoming",
      "ongoing",
      "completed",
    ]),
];
