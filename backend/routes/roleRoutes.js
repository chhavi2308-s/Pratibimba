import express from "express";

import authenticate from "../middleware/authMiddleware.js";
import authorize from "../middleware/authorize.js";

import {
  createRoleValidator,
  updateRoleValidator,
} from "../validators/roleValidator.js";

import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from "../controllers/roleController.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  getRoles
);

router.get(
  "/:id",
  authenticate,
  getRoleById
);

router.post(
  "/",
  authenticate,
  authorize("admin", "lead_auditor"),
  createRoleValidator,
  createRole
);

router.put(
  "/:id",
  authenticate,
  authorize("admin", "lead_auditor"),
  updateRoleValidator,
  updateRole
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  deleteRole
);

export default router;