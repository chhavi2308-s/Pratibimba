import bcrypt from "bcryptjs";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import { markPasswordChanged, isPasswordSessionCurrent } from "../utils/passwordSessions.js";
import { withSuperAdminMutationTransaction } from "./superAdminMutationTransaction.js";
import { recordActivity, userActivityTarget } from "./activityLogService.js";

export const changeOwnPassword = async (actor, { currentPassword, newPassword }, claims) => {
  if (typeof currentPassword !== "string" || typeof newPassword !== "string" ||
      newPassword.length < 10 || newPassword.length > 128 ||
      !/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    throw new AppError("New password must be 10–128 characters and contain letters and numbers.", 400);
  }
  if (currentPassword === newPassword) throw new AppError("Choose a different new password.", 400);
  return withSuperAdminMutationTransaction(async (session) => {
    const user = await User.findById(actor._id).select("+password").session(session);
    if (user?.active !== true) throw new AppError("Account is inactive", 403);
    if (!isPasswordSessionCurrent(user, claims)) {
      throw new AppError("Your password has changed. Please sign in again.", 401);
    }
    if (!await bcrypt.compare(currentPassword, user.password)) {
      throw new AppError("Current password is incorrect.", 400);
    }
    user.password = newPassword;
    markPasswordChanged(user);
    await user.save({ session });
    await recordActivity({ actor: user, target: userActivityTarget(user),
      action: "password_changed", oldValue: {}, newValue: { passwordChanged: true }, session });
  });
};
