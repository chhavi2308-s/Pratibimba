import ScheduledAudit from "../models/ScheduledAudit.js";
import AppError from "../utils/AppError.js";

/**
 * Coordinate consolidated-workflow writes through one Scheduled Audit
 * document within the caller's existing MongoDB transaction.
 *
 * Every participating writer must use this barrier before reading or
 * changing findings that affect completion eligibility.
 */
export const acquireConsolidatedAuditWriteBarrier = async (
  scheduledAuditId,
  session
) => {
  if (!session) {
    throw new AppError(
      "A MongoDB transaction session is required for consolidated audit writes.",
      503
    );
  }

  const audit = await ScheduledAudit.findOneAndUpdate(
    {
      _id: scheduledAuditId,
      workflowMode: "consolidated",
      status: { $ne: "completed" },
    },
    {
      $inc: { workflowRevision: 1 },
    },
    {
      new: true,
      session,
    }
  );

  if (!audit) {
    throw new AppError(
      "This consolidated Scheduled Audit is completed, unavailable, or has an invalid workflow mode.",
      409
    );
  }

  return audit;
};
