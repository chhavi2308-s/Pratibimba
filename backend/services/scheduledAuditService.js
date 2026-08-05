import ScheduledAudit from "../models/ScheduledAudit.js";
import AuditPlan from "../models/AuditPlan.js";
import AppError from "../utils/AppError.js";

export const getScheduledAudits = async () => {
  return await ScheduledAudit.find().sort({ createdAt: -1 });
};

export const getScheduledAuditById = async (id) => {
  const audit = await ScheduledAudit.findById(id);

  if (!audit) {
    throw new AppError("Scheduled Audit not found", 404);
  }

  return audit;
};

export const updateScheduledAudit = async (id, data) => {

  const audit = await ScheduledAudit.findById(id);

  if (!audit) {
    throw new AppError("Scheduled Audit not found", 404);
  }

  // Never allow changing the start date here.
  delete data.startDate;

  Object.assign(audit, data);

  await audit.save();

  // Sync changes back to the Audit Plan
  const plan = await AuditPlan.findById(audit.auditPlan);

  if (plan) {

    plan.auditCoordinator = audit.auditCoordinator;
    plan.auditors = audit.auditors;
    plan.auditAreas = audit.auditAreas;
    plan.location = audit.location;
    plan.sublocation = audit.sublocation;
    plan.prakalphaPramukh = audit.prakalphaPramukh;

    // IMPORTANT:
    // Do NOT modify plan.auditPlannedDate here.
    // Audit Plan is the source of truth for dates.

    await plan.save();
  }

  return audit;
};

export const deleteScheduledAudit = async (id) => {

  const audit = await ScheduledAudit.findById(id);

  if (!audit) {
    throw new AppError("Scheduled Audit not found", 404);
  }

  await audit.deleteOne();

  return;
};

export const markMailSent = async (id) => {

  const audit = await ScheduledAudit.findById(id);

  if (!audit) {
    throw new AppError("Scheduled Audit not found", 404);
  }

  audit.mailSent = true;
  audit.mailSentAt = new Date();

  await audit.save();

  return audit;
};