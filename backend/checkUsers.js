import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const users = await User.find().select("+password");

console.log("\n========== USERS ==========\n");

users.forEach((u) => {
  console.log({
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    active: u.active,
    passwordHash: u.password,
  });
});

process.exit();
