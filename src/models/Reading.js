import mongoose from "mongoose";

const ReadingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    para: {
      type: Number,
      required: true,
      min: 0.5,
      max: 5,
    },
    ramadanDay: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Reading ||
  mongoose.model("Reading", ReadingSchema);
