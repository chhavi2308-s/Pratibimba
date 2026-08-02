import Domain from "../models/Domain.js";
import AppError from "../utils/AppError.js";

export const getDomains = async () => {
  return await Domain.find({ active: true }).sort({ name: 1 });
};

export const createDomain = async (data) => {
  const exists = await Domain.findOne({
    name: data.name,
  });

  if (exists) {
    throw new AppError("Domain already exists", 409);
  }

  return await Domain.create(data);
};

export const updateDomain = async (id, data) => {
  const domain = await Domain.findById(id);

  if (!domain) {
    throw new AppError("Domain not found", 404);
  }

  Object.assign(domain, data);

  await domain.save();

  return domain;
};

export const deleteDomain = async (id) => {
  const domain = await Domain.findById(id);

  if (!domain) {
    throw new AppError("Domain not found", 404);
  }

  domain.active = false;

  await domain.save();

  return domain;
};
