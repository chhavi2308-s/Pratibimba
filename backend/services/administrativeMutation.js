import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import { withSuperAdminMutationTransaction } from "./superAdminMutationTransaction.js";

export const assertSuperAdmin = (actor) => {
  if (actor?.active !== true || actor.role !== "super_admin") {
    throw new AppError("Only an active Superadmin can manage administrative records.", 403);
  }
};

// Account revocations and role mutations take the SAME guard before reading
// authority. A conflicting transaction must retry and authorize afresh.
export const withAdministrativeMutation = (actor, operation) => {
  assertSuperAdmin(actor);
  return withSuperAdminMutationTransaction(async (session) => {
    const freshActor = await User.findById(actor._id).session(session);
    assertSuperAdmin(freshActor);
    return operation(freshActor, session);
  });
};
