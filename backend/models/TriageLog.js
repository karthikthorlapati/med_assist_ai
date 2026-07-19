import mongoose from "mongoose";

const triageLogSchema = new mongoose.Schema(
  {
    symptomText: { type: String, required: true },
    tier: {
      type: String,
      enum: ["self-care", "visit-facility", "emergency"],
      required: true,
    },
    aiSummary: { type: String, required: true },
    firstAidSteps: { type: [String], default: [] },
    inputMethod: { type: String, enum: ["text", "voice"], default: "text" },
  },
  { timestamps: true }
);

export default mongoose.model("TriageLog", triageLogSchema);
