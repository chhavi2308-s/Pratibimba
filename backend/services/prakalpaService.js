import Prakalpa from "../models/Prakalpa.js";
import Location from "../models/Location.js";
import AppError from "../utils/AppError.js";
import { withAdministrativeMutation } from "./administrativeMutation.js";
import { organizationalFields } from "./organizationalFields.js";

const editable = (data, creating = false) => organizationalFields(data, {
  text: ["name", "prakalpaPramukh", "prakalpaPramukhEmail", "seniorEmail", ...(creating ? ["initialLocation"] : [])],
  arrays: ["auditAreas"], creating,
});

export const getPrakalpas = async (actor) => {
  const query = Prakalpa.find({ active: true }).sort({ name: 1 });
  if (actor?.role !== "super_admin") {
    // Planning needs areas/Pramukh; reporting needs the configured delivery contacts.
    query.select("_id name auditAreas prakalpaPramukh prakalpaPramukhEmail seniorEmail active");
  }
  return query;
};

export const createPrakalpa = async (data, actor) => {
  return withAdministrativeMutation(actor, async (_freshActor, session) => {
    const fields = editable(data, true);
    const { initialLocation, ...prakalpaData } = fields;
    if (!initialLocation) throw new AppError("Location is required to create a Prakalpa.", 400);
    const exists = await Prakalpa.findOne({ name: fields.name }).session(session);
    if (exists) throw new AppError("Prakalpa already exists", 409);
    const [prakalpa] = await Prakalpa.create([prakalpaData], { session });
    await Location.create([{
      prakalpa: fields.name, name: initialLocation, sublocations: [], active: true,
    }], { session });
    return prakalpa;
  });
};

export const updatePrakalpa = async (id, data, actor) => {
  return withAdministrativeMutation(actor, async (_freshActor, session) => {
    const fields = editable(data);
    const prakalpa = await Prakalpa.findById(id).session(session);
    if (!prakalpa) throw new AppError("Prakalpa not found", 404);
    for (const [key, value] of Object.entries(fields)) prakalpa[key] = value;
    await prakalpa.save({ session });
    return prakalpa;
  });
};

export const deletePrakalpa = async (id, actor) => {
  return withAdministrativeMutation(actor, async (_freshActor, session) => {
    const prakalpa = await Prakalpa.findById(id).session(session);
    if (!prakalpa) throw new AppError("Prakalpa not found", 404);
    prakalpa.active = false;
    await prakalpa.save({ session });
    return prakalpa;
  });
};
