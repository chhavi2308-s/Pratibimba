import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

import ScheduledAudit from "../models/ScheduledAudit.js";
import { acquireConsolidatedAuditWriteBarrier } from "../services/consolidatedAuditWriteBarrier.js";

const originalFindOneAndUpdate = ScheduledAudit.findOneAndUpdate;

test.afterEach(() => {
  ScheduledAudit.findOneAndUpdate = originalFindOneAndUpdate;
});

test("Scheduled Audit defines workflowRevision with a zero default", () => {
  const audit = new ScheduledAudit({
    auditPlan: new mongoose.Types.ObjectId(),
    iqaNumber: "IQA-BARRIER-TEST",
    prakalpa: "Test",
    location: "Test",
    auditCoordinator: "Coordinator",
    startDate: new Date(),
    endDate: new Date(),
  });

  assert.equal(audit.workflowRevision, 0);
});

test("Barrier requires an existing transaction session", async () => {
  await assert.rejects(
    acquireConsolidatedAuditWriteBarrier("audit-1", null),
    { statusCode: 503 }
  );
});

test("Barrier increments revision and rejects completed audits", async () => {
  const session = { testSession: true };
  let captured;

  ScheduledAudit.findOneAndUpdate = async (...args) => {
    captured = args;
    return { _id: "audit-1", workflowMode: "consolidated" };
  };

  const audit = await acquireConsolidatedAuditWriteBarrier(
    "audit-1",
    session
  );

  assert.equal(audit._id, "audit-1");
  assert.equal(captured[0]._id, "audit-1");
  assert.equal(captured[0].workflowMode, "consolidated");
  assert.deepEqual(captured[0].status, { $ne: "completed" });
  assert.deepEqual(captured[1], {
    $inc: { workflowRevision: 1 },
  });
  assert.equal(captured[2].session, session);
  assert.equal(captured[2].new, true);

  ScheduledAudit.findOneAndUpdate = async () => null;

  await assert.rejects(
    acquireConsolidatedAuditWriteBarrier("audit-1", session),
    { statusCode: 409 }
  );
});
