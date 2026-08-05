import AuditPlan from "../models/AuditPlan.js";
import ScheduledAudit from "../models/ScheduledAudit.js";
import AppError from "../utils/AppError.js";

export const getAuditPlans = async () => {
  return await AuditPlan.find().sort({ createdAt: -1 });
};

export const getAuditPlanById = async (id) => {
  const plan = await AuditPlan.findById(id);

  if (!plan) {
    throw new AppError("Audit Plan not found", 404);
  }

  return plan;
};

export const createAuditPlan = async (data) => {
  const currentYear = new Date().getFullYear();

  // Find all audit plans for the current year
  const plans = await AuditPlan.find(
    {
      iqaNumber: new RegExp(`^IQA-${currentYear}-`)
    },
    "iqaNumber"
  );

  let maxNumber = 0;

  for (const plan of plans) {
    if (!plan.iqaNumber) continue;

    const match = plan.iqaNumber.match(
      new RegExp(`^IQA-${currentYear}-(\\d{4})$`)
    );

    if (match) {
      const num = parseInt(match[1], 10);

      if (num > maxNumber) {
        maxNumber = num;
      }
    }
  }

  const nextNumber = maxNumber + 1;

  const iqaNumber = `IQA-${currentYear}-${String(nextNumber).padStart(4, "0")}`;

  const auditPlan = await AuditPlan.create({
    ...data,
    iqaNumber,
  });

  return await AuditPlan.findById(auditPlan._id);
};

export const updateAuditPlan = async (id, data) => {

  const plan = await AuditPlan.findById(id);

  if (!plan) {
    throw new AppError("Audit Plan not found", 404);
  }

  Object.assign(plan, data);

  await plan.save();

  // Keep scheduled audit synchronized
  const scheduledAudit = await ScheduledAudit.findOne({
    auditPlan: plan._id,
  });

  if (scheduledAudit) {

    scheduledAudit.startDate = plan.auditPlannedDate;

    if (
      scheduledAudit.endDate <
      scheduledAudit.startDate
    ) {
      scheduledAudit.endDate = plan.auditPlannedDate;
    }

    scheduledAudit.auditCoordinator =
      plan.auditCoordinator;

    scheduledAudit.auditors =
      plan.auditors;

    scheduledAudit.auditAreas =
      plan.auditAreas;

    scheduledAudit.location =
      plan.location;

    scheduledAudit.sublocation =
      plan.sublocation;

    scheduledAudit.prakalphaPramukh =
      plan.prakalphaPramukh;

    await scheduledAudit.save();
  }

  return await AuditPlan.findById(plan._id);

};

export const deleteAuditPlan = async (id) => {
  const plan = await AuditPlan.findById(id);

  if (!plan) {
    throw new AppError("Audit Plan not found", 404);
  }

  // Delete corresponding Scheduled Audit
  await ScheduledAudit.deleteOne({
    auditPlan: plan._id,
  });

  // Delete Audit Plan
  await ScheduledAudit.deleteOne({
    auditPlan: plan._id,
  });

  await plan.deleteOne();

  return;
};
export const scheduleAuditPlan = async (id, scheduleData) => {

  const plan = await AuditPlan.findById(id);

  if (!plan) {
    throw new AppError("Audit Plan not found", 404);
  }

  // Update Audit Plan
  if (scheduleData.auditPlannedDate) {
    plan.auditPlannedDate = scheduleData.auditPlannedDate;
  }

  if (scheduleData.auditCoordinator) {
    plan.auditCoordinator = scheduleData.auditCoordinator;
  }

  if (scheduleData.auditors) {
    plan.auditors = scheduleData.auditors;
  }

  plan.status = "scheduled";

  await plan.save();

  // Check if Scheduled Audit already exists
  let scheduledAudit = await ScheduledAudit.findOne({
    auditPlan: plan._id,
  });

  const scheduledAuditData = {
    auditPlan: plan._id,

    iqaNumber: plan.iqaNumber,

    domain: plan.domain,

    location: plan.location,

    sublocation: plan.sublocation,

    prakalpa: plan.prakalpa,

    auditCoordinator: plan.auditCoordinator,

    prakalphaPramukh: plan.prakalphaPramukh,

    auditAreas: plan.auditAreas,

    auditors: plan.auditors,

    finalAuditor:
      plan.auditors.length > 0
        ? plan.auditors[0]
        : "",

    startDate: plan.auditPlannedDate,

    endDate: plan.auditPlannedDate,

    mailSent: false,
  };

  if (scheduledAudit) {

    Object.assign(
      scheduledAudit,
      scheduledAuditData
    );

    await scheduledAudit.save();

  } else {

    scheduledAudit = new ScheduledAudit(
      scheduledAuditData
    );

    await scheduledAudit.save();
  }

  return await AuditPlan.findById(plan._id);

};