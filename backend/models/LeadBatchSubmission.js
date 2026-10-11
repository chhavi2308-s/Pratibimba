import mongoose from "mongoose";
const schema = new mongoose.Schema({
  scheduledAudit: { type: mongoose.Schema.Types.ObjectId, ref: "ScheduledAudit", required: true },
  leadAuditor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  approvedCount: { type: Number, required: true, min: 0 },
  discardedCount: { type: Number, required: true, min: 0 },
  submittedAt: { type: Date, default: Date.now, required: true },
}, { timestamps: true });
schema.index({ scheduledAudit: 1 }, { unique: true });
export default mongoose.models.LeadBatchSubmission || mongoose.model("LeadBatchSubmission", schema);
