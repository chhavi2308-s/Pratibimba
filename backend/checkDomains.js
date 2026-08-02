import dotenv from "dotenv";
import mongoose from "mongoose";
import Domain from "./models/Domain.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

console.log(await Domain.find());

process.exit();
