import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema(
  {
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
      unique: true,
    },

    canCreateAuditPlan: {
      type: Boolean,
      default: false,
    },

    canScheduleAudit: {
      type: Boolean,
      default: false,
    },

    canEditReport: {
      type: Boolean,
      default: false,
    },

    canCloseReport: {
      type: Boolean,
      default: false,
    },

    canViewAllReports: {
      type: Boolean,
      default: false,
    },

    canManageRoles: {
      type: Boolean,
      default: false,
    },

    canManageUsers: {
      type: Boolean,
      default: false,
    },

    canViewDashboard: {
      type: Boolean,
      default: false,
    },

    canAddAuditor: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Permission", permissionSchema);
