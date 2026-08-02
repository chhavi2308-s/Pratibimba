import Role from "../models/Role.js";
import AppError from "../utils/AppError.js";

export const getRoles = async () => {
  return await Role.find({ active: true }).sort({ label: 1 });
};

export const getRoleById = async (id) => {
  const role = await Role.findById(id);

  if (!role) {
    throw new AppError("Role not found", 404);
  }

  return role;
};

export const createRole = async (data) => {
  const existing = await Role.findOne({
    name: data.name.toLowerCase(),
  });

  if (existing) {
    throw new AppError("Role already exists", 409);
  }

  return await Role.create({
    ...data,
    name: data.name.toLowerCase(),
  });
};

export const updateRole = async (id, data) => {
  const role = await Role.findById(id);

  if (!role) {
    throw new AppError("Role not found", 404);
  }

  Object.assign(role, data);

  await role.save();

  return role;
};

export const deleteRole = async (id) => {
  const role = await Role.findById(id);

  if (!role) {
    throw new AppError("Role not found", 404);
  }

  role.active = false;

  await role.save();

  return role;
};
