import dotenv from "dotenv";
import mongoose from "mongoose";
import Role from "./models/Role.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

console.log(await Role.find());

process.exit();
