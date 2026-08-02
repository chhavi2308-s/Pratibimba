import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

await connectDB();

const existing = await User.findOne({
  email: "admin@pratibimba.com"
});

if (!existing) {
  await User.create({
    name: "System Administrator",
    email: "admin@pratibimba.com",
    phone: "9999999999",
    password: "Admin@123",
    role: "admin",
    domain: "All",
    active: true
  });

  console.log("✅ Admin user created");
} else {
  console.log("ℹ️ Admin already exists");
}

await mongoose.disconnect();
