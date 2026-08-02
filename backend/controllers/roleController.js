import { validationResult } from "express-validator";

import asyncHandler from "../middleware/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import AppError from "../utils/AppError.js";

import * as roleService from "../services/roleService.js";

export const getRoles = asyncHandler(async (req, res) => {
  const roles = await roleService.getRoles();

  res.status(200).json(
    new ApiResponse(
      200,
      "Roles fetched successfully",
      roles
    )
  );
});

export const getRoleById = asyncHandler(async (req, res) => {
  const role = await roleService.getRoleById(req.params.id);

  res.status(200).json(
    new ApiResponse(
      200,
      "Role fetched successfully",
      role
    )
  );
});

export const createRole = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const role = await roleService.createRole(req.body);

  res.status(201).json(
    new ApiResponse(
      201,
      "Role created successfully",
      role
    )
  );
});

export const updateRole = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const role = await roleService.updateRole(
    req.params.id,
    req.body
  );

  res.status(200).json(
    new ApiResponse(
      200,
      "Role updated successfully",
      role
    )
  );
});

export const deleteRole = asyncHandler(async (req, res) => {
  await roleService.deleteRole(req.params.id);

  res.status(200).json(
    new ApiResponse(
      200,
      "Role deleted successfully"
    )
  );
});
