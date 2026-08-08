import Report from "../models/Report.js";
import ScheduledAudit from "../models/ScheduledAudit.js";
import AuditPlan from "../models/AuditPlan.js";
import AppError from "../utils/AppError.js";

export const createReport = async (data) => {
  const audit = await ScheduledAudit.findById(data.scheduledAudit);

  if (!audit) {
    throw new AppError("Scheduled Audit not found", 404);
  }

  // Change 1: Validate top-level observations array
  if (!Array.isArray(data.observations) || data.observations.length === 0) {
    throw new AppError("At least one observation is required.", 400);
  }

  const currentYear = new Date().getFullYear();

  const reports = await Report.find(
    {
      iqrNumber: new RegExp(`^IQR-${currentYear}-`),
    },
    "iqrNumber"
  );

  let maxNumber = 0;

  for (const report of reports) {
    const match = report.iqrNumber.match(
      new RegExp(`^IQR-${currentYear}-(\\d{4})$`)
    );

    if (!match) continue;

    const number = parseInt(match[1], 10);

    if (number > maxNumber) {
      maxNumber = number;
    }
  }

  const nextNumber = maxNumber + 1;
  let runningNumber = nextNumber;

  const createdReports = [];

  for (const observation of data.observations) {
    // Change 2: Validate each observation item
    if (!observation.findings || !observation.severity) {
      throw new AppError(
        "Each observation must contain findings and classification.",
        400
      );
    }

    const iqrNumber = `IQR-${currentYear}-${String(runningNumber).padStart(4, "0")}`;
    runningNumber++;

    const report = await Report.create({
      iqrNumber,
      auditPlan: audit.auditPlan,
      scheduledAudit: audit._id,
      iqaNumber: audit.iqaNumber,
      prakalpa: audit.prakalpa,
      domain: audit.domain,
      location: audit.location,
      sublocation: audit.sublocation,
      auditCoordinator: audit.auditCoordinator,

      auditors: audit.auditors,

      // =========================
      // Audit Metadata
      // =========================

      auditAreas:
        audit.auditAreas || [],

      purpose:
        audit.purpose || "",

      prakalphaPramukh:
        audit.prakalphaPramukh || "",

      visitDate: data.visitDate,
      visitTime: data.visitTime,
      severity: observation.severity,
      findings: observation.findings,
      // Change 3: Safe array mapping for proofFiles
      proofFiles: Array.isArray(observation.proofFiles)
        ? observation.proofFiles
        : [],
      hasChecklist: data.hasChecklist || false,
      status: "open",
      reportCreatedOn: new Date(),
    });

    createdReports.push(report);
  }

  // Cleanup completed schedule and plan entries
  await ScheduledAudit.findByIdAndDelete(audit._id);
  await AuditPlan.findByIdAndDelete(audit.auditPlan);

  return createdReports;
};

export const getReports = async () => {
  return await Report.find().sort({
    createdAt: -1,
  });
};

export const getReportById = async (id) => {
  const report = await Report.findById(id);

  if (!report) {
    throw new AppError("Report not found", 404);
  }

  return report;
};

// ===================================
// Close Report
// ===================================

export const closeReport = async (id, data, currentUser) => {
  const report = await Report.findById(id);

  if (!report) {
    throw new AppError("Report not found", 404);
  }

  report.status = "closed";
  report.actionTaken = data.actionTaken;
  report.completionRemarks = data.completionRemarks;
  report.closedBy =
    currentUser?.name || currentUser?.email || "Unknown User";
  const closedTime = new Date();

  report.closedAt = closedTime;

  report.reportClosedOn = closedTime;

  if (data.proofFiles && Array.isArray(data.proofFiles)) {
    report.proofFiles = data.proofFiles;
  }

  await report.save();
  return report;
};

// ===================================
// Update Report
// ===================================

export const updateReport = async (id, data) => {
  const report = await Report.findById(id);

  if (!report) {
    throw new AppError("Report not found", 404);
  }

  // Editable fields
  report.findings = data.findings;
  report.severity = data.severity;
  report.actionTaken = data.actionTaken || "";
  report.completionRemarks = data.completionRemarks || "";

  // --------------------
  // Reopen Report
  // --------------------
  if (report.status === "closed" && data.status === "open") {
    report.status = "open";
    report.actionTaken = "";
    report.completionRemarks = "";
    report.closedBy = "";
    report.closedAt = null;
    report.reportClosedOn = null;
  }

  await report.save();
  return report;
};