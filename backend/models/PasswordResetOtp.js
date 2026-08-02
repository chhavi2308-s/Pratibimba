import mongoose from "mongoose";

const passwordResetOtpSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    otp: {
      type: String,
      required: true,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: {
        expires: 0
      }
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model(
  "PasswordResetOtp",
  passwordResetOtpSchema
);
