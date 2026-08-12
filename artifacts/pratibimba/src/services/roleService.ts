import api from "./api";

export interface RolePermissionPayload {
  canCreateAuditPlan?: boolean;
  canScheduleAudit?: boolean;
  canEditReport?: boolean;
  canCloseReport?: boolean;
  canViewAllReports?: boolean;
  canManageRoles?: boolean;
  canManageUsers?: boolean;
  canViewDashboard?: boolean;
  canAddAuditor?: boolean;
}

export interface BackendRole {
  _id: string;
  name: string;
  permissions: {
    canCreateAuditPlan: boolean;
    canScheduleAudit: boolean;
    canEditReport: boolean;
    canCloseReport: boolean;
    canViewAllReports: boolean;
    canManageRoles: boolean;
    canManageUsers: boolean;
    canViewDashboard: boolean;
    canAddAuditor: boolean;
  };
  active: boolean;
}

export const getRoles = async (): Promise<BackendRole[]> => {
  const response = await api.get("/roles");
  return response.data?.data ?? response.data ?? [];
};

export const updateRole = async (
  id: string,
  permissions: RolePermissionPayload
): Promise<BackendRole> => {
  const response = await api.put(`/roles/${id}`, { permissions });
  return response.data?.data ?? response.data;
};
