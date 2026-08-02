import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const email = "admin@pratibimba.com";
const newPassword = "test123";

const hashedPassword = await bcrypt.hash(newPassword, 12);

const user = await User.findOneAndUpdate(
  { email },
  { password: hashedPassword },
  { new: true }
);

if (!user) {
  console.log("❌ Admin user not found.");
} else {
  console.log("✅ Password reset successfully!");
  console.log("Email:", user.email);
  console.log("Password:", newPassword);
}

await mongoose.disconnect();
process.exit();
