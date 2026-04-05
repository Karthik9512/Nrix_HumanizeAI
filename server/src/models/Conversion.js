import mongoose from "mongoose";

const conversionSchema = new mongoose.Schema(
  {
    originalText: {
      type: String,
      required: true,
      trim: true,
    },
    humanizedText: {
      type: String,
      required: true,
      trim: true,
    },
    tone: {
      type: String,
      enum: ["casual", "professional", "friendly"],
      required: true,
    },
    mode: {
      type: String,
      enum: ["humanize", "formal", "simplify", "expand", "academic"],
      default: "humanize",
    },
    creativity: {
      type: Number,
      min: 1,
      max: 10,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Conversion = mongoose.model("Conversion", conversionSchema);

export default Conversion;
