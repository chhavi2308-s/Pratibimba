import express from "express";

import authenticate from "../middleware/authMiddleware.js";

import {
  createReport,
  getReports,
  getReportById,
  closeReport,
  updateReport,
} from "../controllers/reportController.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  getReports
);

router.get(
  "/:id",
  authenticate,
  getReportById
);

router.post(
  "/",
  authenticate,
  createReport
);

// ===========================
// Close Report
// ===========================

router.patch(
  "/:id/close",
  authenticate,
  closeReport
);
router.patch(
  "/:id",
  authenticate,
  updateReport
);
export default router;