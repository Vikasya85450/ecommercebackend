import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
  actor: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    role: String,
  },
  action: {
    type: String,
    required: true,
  },
  target: {
    type: String,
    required: true,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
  },
}, { timestamps: { createdAt: "timestamp", updatedAt: false } });

const ActivityLog = mongoose.models.ActivityLog || mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;
