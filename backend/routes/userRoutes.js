import express from "express";

import authenticate from "../middleware/authMiddleware.js";
import authorize from "../middleware/authorize.js";

import {
  getUsers,
  getAuditorDirectory,
  getAuditPersonDirectory,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changeUserRole,
} from "../controllers/userController.js";

import {
  createUserValidator,
  updateUserValidator,
  changeUserRoleValidator,
} from "../validators/userValidator.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorize("super_admin"),
  getUsers
);

router.get(
  "/auditor-directory",
  authenticate,
  authorize("super_admin", "admin", "audit_coordinator"),
  getAuditorDirectory
);

router.get(
  "/audit-directory",
  authenticate,
  authorize("super_admin", "admin", "audit_coordinator"),
  getAuditPersonDirectory
);

router.get(
  "/:id",
  authenticate,
  authorize("super_admin"),
  getUserById
);

router.post(
  "/",
  authenticate,
  authorize("super_admin"),
  createUserValidator,
  createUser
);

router.patch(
  "/:id/role",
  authenticate,
  authorize("super_admin"),
  changeUserRoleValidator,
  changeUserRole
);

router.put(
  "/:id",
  authenticate,
  authorize("super_admin"),
  updateUserValidator,
  updateUser
);

router.delete(
  "/:id",
  authenticate,
  authorize("super_admin"),
  deleteUser
);

export default router;
