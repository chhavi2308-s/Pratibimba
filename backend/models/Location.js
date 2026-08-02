import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    domain: {
      type: String,
      required: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    sublocations: [
      {
        type: String,
        trim: true,
      },
    ],

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

locationSchema.index(
  {
    domain: 1,
    name: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model("Location", locationSchema);