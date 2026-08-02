import asyncHandler from "../middleware/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import * as domainService from "../services/domainService.js";

export const getDomains = asyncHandler(async (req, res) => {
  const domains = await domainService.getDomains();

  res.status(200).json(
    new ApiResponse(
      200,
      "Domains fetched successfully",
      domains
    )
  );
});

export const createDomain = asyncHandler(async (req, res) => {
  const domain = await domainService.createDomain(req.body);

  res.status(201).json(
    new ApiResponse(
      201,
      "Domain created successfully",
      domain
    )
  );
});

export const updateDomain = asyncHandler(async (req, res) => {
  const domain = await domainService.updateDomain(
    req.params.id,
    req.body
  );

  res.status(200).json(
    new ApiResponse(
      200,
      "Domain updated successfully",
      domain
    )
  );
});

export const deleteDomain = asyncHandler(async (req, res) => {
  await domainService.deleteDomain(req.params.id);

  res.status(200).json(
    new ApiResponse(
      200,
      "Domain deleted successfully"
    )
  );
});
