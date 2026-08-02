import Location from "../models/Location.js";
import Domain from "../models/Domain.js";
import AppError from "../utils/AppError.js";

export const getLocations = async () => {
  return await Location.find({ active: true })
    .populate("domain", "name")
    .sort({
      name: 1,
    });
};

export const getLocationsByDomain = async (domainId) => {
  return await Location.find({
    domain: domainId,
    active: true,
  }).sort({
    name: 1,
  });
};

export const createLocation = async (data) => {
  const domain = await Domain.findById(data.domain);

  if (!domain) {
    throw new AppError("Domain not found", 404);
  }

  const exists = await Location.findOne({
    domain: data.domain,
    name: data.name,
  });

  if (exists) {
    throw new AppError("Location already exists", 409);
  }

  return await Location.create(data);
};

export const updateLocation = async (id, data) => {
  const location = await Location.findById(id);

  if (!location) {
    throw new AppError("Location not found", 404);
  }

  Object.assign(location, data);

  await location.save();

  return location;
};

export const deleteLocation = async (id) => {
  const location = await Location.findById(id);

  if (!location) {
    throw new AppError("Location not found", 404);
  }

  location.active = false;

  await location.save();

  return location;
};
