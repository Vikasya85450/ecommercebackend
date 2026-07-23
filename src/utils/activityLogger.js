import ActivityLog from "../models/activityLog.js";

export const logActivity = async ({ actor, action, target, targetId }) => {
  try {
    await ActivityLog.create({
      actor: {
        id: actor?.id,
        name: actor?.name,
        role: actor?.role,
      },
      action,
      target,
      targetId,
    });
  } catch (error) {
    console.log("activity log error:", error.message);
  }
};
