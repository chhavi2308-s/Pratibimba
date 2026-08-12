import PDFDocument from "pdfkit";
import Report from "../models/Report.js";
import ScheduledAudit from "../models/ScheduledAudit.js";
import AuditPlan from "../models/AuditPlan.js";
import AppError from "../utils/AppError.js";

export const createReport = async (data) => {
  const audit = await ScheduledAudit.findById(data.scheduledAudit);

  if (!audit) {
    throw new AppError("Scheduled Audit not found", 404);
  }

  // Validate top-level observations array
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
    // Validate each observation item
    if (!observation.findings || !observation.severity) {
      throw new AppError(
        "Each observation must contain findings and classification.",
        400
      );
    }

    const iqrNumber = `IQR-${currentYear}-${String(runningNumber).padStart(
      4,
      "0"
    )}`;

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

      auditAreas: audit.auditAreas || [],
      purpose: audit.purpose || "",
      prakalphaPramukh: audit.prakalphaPramukh || "",

      visitDate: data.visitDate,
      visitTime: data.visitTime,

      severity: observation.severity,
      findings: observation.findings,

      proofFiles: Array.isArray(observation.proofFiles)
        ? observation.proofFiles
        : [],

      hasChecklist: data.hasChecklist || false,

      // =========================
      // Report Lifecycle
      // =========================

      status: "open",
      reportCreatedOn: new Date(),
    });

    createdReports.push(report);
  }

  // IMPORTANT:
  // Do NOT delete the ScheduledAudit or AuditPlan here.
  // They are historical lifecycle records for this IQA number.
  //
  // The audit remains traceable as:
  //
  // AuditPlan -> ScheduledAudit -> Report(s)
  //
  // Mark the lifecycle as completed instead.

  audit.status = "completed";
  await audit.save();

  await AuditPlan.findByIdAndUpdate(audit.auditPlan, {
    status: "completed",
  });

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

export const generateReportPDF = async (id) => {
  const report = await Report.findById(id);

  if (!report) {
    throw new AppError("Report not found", 404);
  }

  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
  });

  doc.info.Title = `Audit Report - ${report.iqrNumber}`;
  doc.info.Author = "Pratibimba Audit Management System";

  doc.fontSize(20)
    .font("Helvetica-Bold")
    .text("PRATIBIMBA AUDIT REPORT", {
      align: "center",
    });

  doc.moveDown(0.5);

  doc.fontSize(13)
    .font("Helvetica-Bold")
    .text(report.iqrNumber, {
      align: "center",
    });

  doc.moveDown(1.5);

  const addField = (label, value) => {
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .text(`${label}: `, {
        continued: true,
      })
      .font("Helvetica")
      .text(value || "—");

    doc.moveDown(0.35);
  };

  addField("IQA Number", report.iqaNumber);
  addField("Domain", report.domain);
  addField("Location", report.location);
  addField("Sublocation", report.sublocation);
  addField("Prakalpa", report.prakalpa);
  addField("Audit Coordinator", report.auditCoordinator);
  addField(
    "Auditors",
    Array.isArray(report.auditors)
      ? report.auditors.join(", ")
      : ""
  );
  addField(
    "Prakalpha Pramukh",
    report.prakalphaPramukh
  );
  addField(
    "Audit Areas",
    Array.isArray(report.auditAreas)
      ? report.auditAreas.join(", ")
      : ""
  );
  addField("Purpose", report.purpose);
  addField(
    "Visit Date",
    report.visitDate
      ? new Date(report.visitDate).toLocaleDateString()
      : ""
  );
  addField("Visit Time", report.visitTime);
  addField("Status", report.status);
  addField(
    "Report Created",
    report.reportCreatedOn
      ? new Date(report.reportCreatedOn).toLocaleString()
      : ""
  );

  doc.moveDown(1);

  doc
    .fontSize(13)
    .font("Helvetica-Bold")
    .text("Finding");

  doc.moveDown(0.5);

  doc
    .fontSize(10)
    .font("Helvetica")
    .text(report.findings || "—", {
      lineGap: 4,
    });

  doc.moveDown(1);

  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .text("Classification");

  doc.moveDown(0.35);

  doc
    .fontSize(10)
    .font("Helvetica")
    .text(
      report.severity === "non_conformance"
        ? "Non-Conformance"
        : "Open for Improvement"
    );

  if (report.actionTaken) {
    doc.moveDown(1);

    doc
      .fontSize(13)
      .font("Helvetica-Bold")
      .text("Action Taken");

    doc.moveDown(0.5);

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(report.actionTaken, {
        lineGap: 4,
      });
  }

  if (report.completionRemarks) {
    doc.moveDown(1);

    doc
      .fontSize(13)
      .font("Helvetica-Bold")
      .text("Completion Remarks");

    doc.moveDown(0.5);

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(report.completionRemarks, {
        lineGap: 4,
      });
  }

  if (report.closedBy || report.closedAt) {
    doc.moveDown(1);

    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("Closure");

    doc.moveDown(0.35);

    addField("Closed By", report.closedBy);
    addField(
      "Closed At",
      report.closedAt
        ? new Date(report.closedAt).toLocaleString()
        : ""
    );
  }

  doc.moveDown(1.5);

  doc
    .fontSize(8)
    .font("Helvetica")
    .fillColor("#666666")
    .text(
      "Generated by Pratibimba Audit Management System",
      {
        align: "center",
      }
    );

  doc.end();

  return doc;
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