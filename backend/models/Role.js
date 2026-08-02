import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema(
  {
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
      default: true,
    },

    canAddAuditor: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    permissions: {
      type: permissionSchema,
      default: () => ({}),
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Role", roleSchema);
