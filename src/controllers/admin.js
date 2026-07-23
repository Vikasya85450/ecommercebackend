import User from "../models/userModel.js";
import Order from "../models/order.js";
import Product from "../models/product.js";
import ActivityLog from "../models/activityLog.js";
import { logActivity } from "../utils/activityLogger.js";
import { cacheGet, cacheSet } from "../config/redis.js";

const STATUS_MAP = {
  pending: "placed",
  placed: "placed",
  shipped: "shipped",
  delivered: "delivered",
  cancelled: "cancelled",
  canceled: "cancelled",
};

const normalizeStatus = (value) => STATUS_MAP[(value || "").toString().trim().toLowerCase()] || null;

export const statsSummary = async (req, res) => {
  try {
    const cacheKey = "admin:stats:summary";
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, data: cached, message: "Stats summary fetched" });
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [totalUsers, totalOrders, totalProducts, pendingOrders, ordersToday, revenueAgg] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments({ orderStatus: "placed" }),
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),
      Order.aggregate([
        { $match: { orderStatus: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

    const data = {
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue: revenueAgg[0]?.total || 0,
      pendingOrders,
      ordersToday,
    };

    await cacheSet(cacheKey, data, 60);

    return res.status(200).json({ success: true, data, message: "Stats summary fetched" });
  } catch (error) {
    console.error("stats summary error:", error);
    return res.status(500).json({ success: false, data: null, message: "Server error" });
  }
};

export const statsSales = async (req, res) => {
  try {
    const range = ["7d", "30d", "12m"].includes(req.query.range) ? req.query.range : "7d";
    const cacheKey = `admin:stats:sales:${range}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, data: cached, message: "Sales stats fetched" });
    }

    const now = new Date();
    let startDate;
    let dateFormat;

    if (range === "7d") {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      dateFormat = "%Y-%m-%d";
    } else if (range === "30d") {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
      dateFormat = "%Y-%m-%d";
    } else {
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 11);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      dateFormat = "%Y-%m";
    }

    const rows = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          orderStatus: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
          sales: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const data = rows.map((row) => ({ date: row._id, sales: row.sales, orders: row.orders }));

    await cacheSet(cacheKey, data, 120);

    return res.status(200).json({ success: true, data, message: "Sales stats fetched" });
  } catch (error) {
    console.error("stats sales error:", error);
    return res.status(500).json({ success: false, data: null, message: "Server error" });
  }
};

export const listUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 20, 1);
    const search = (req.query.search || "").trim();

    const match = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [result] = await User.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "user",
          as: "orders",
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          isBanned: 1,
          createdAt: 1,
          orderCount: { $size: "$orders" },
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          users: [{ $skip: (page - 1) * limit }, { $limit: limit }],
          total: [{ $count: "count" }],
        },
      },
    ]);

    const users = result?.users || [];
    const total = result?.total?.[0]?.count || 0;

    return res.status(200).json({
      success: true,
      data: { users, total, page, limit },
      message: "Users fetched",
    });
  } catch (error) {
    console.error("list users error:", error);
    return res.status(500).json({ success: false, data: null, message: "Server error" });
  }
};

export const getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -otp -otpExpires");

    if (!user) {
      return res.status(404).json({ success: false, data: null, message: "User not found" });
    }

    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: { user, orders },
      message: "User detail fetched",
    });
  } catch (error) {
    console.error("get user detail error:", error);
    return res.status(500).json({ success: false, data: null, message: "Server error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, isBanned } = req.body;

    if (role !== undefined && !["user", "admin"].includes(role)) {
      return res.status(400).json({ success: false, data: null, message: "Invalid role" });
    }

    const update = {};
    const changes = [];

    if (role !== undefined) {
      update.role = role;
      changes.push(`role to "${role}"`);
    }
    if (isBanned !== undefined) {
      update.isBanned = Boolean(isBanned);
      changes.push(isBanned ? "banned" : "unbanned");
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ success: false, data: null, message: "Nothing to update" });
    }

    const user = await User.findByIdAndUpdate(id, update, { new: true }).select("-password -otp -otpExpires");

    if (!user) {
      return res.status(404).json({ success: false, data: null, message: "User not found" });
    }

    await logActivity({
      actor: req.user,
      action: `updated user "${user.email}" (${changes.join(", ")})`,
      target: "user",
      targetId: user._id,
    });

    return res.status(200).json({ success: true, data: user, message: "User updated" });
  } catch (error) {
    console.error("update user error:", error);
    return res.status(500).json({ success: false, data: null, message: "Server error" });
  }
};

export const listOrdersAdmin = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 20, 1);
    const { status, search } = req.query;

    const match = {};
    if (status) {
      const normalized = normalizeStatus(status);
      if (!normalized) {
        return res.status(400).json({ success: false, data: null, message: "Invalid status filter" });
      }
      match.orderStatus = normalized;
    }

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { "customer.name": { $regex: search, $options: "i" } },
            { "customer.email": { $regex: search, $options: "i" } },
            { "address.name": { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    pipeline.push(
      {
        $project: {
          items: 1,
          address: 1,
          totalAmount: 1,
          paymentMethod: 1,
          paymentStatus: 1,
          orderStatus: 1,
          createdAt: 1,
          customer: { _id: "$customer._id", name: "$customer.name", email: "$customer.email" },
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          orders: [{ $skip: (page - 1) * limit }, { $limit: limit }],
          total: [{ $count: "count" }],
        },
      }
    );

    const [result] = await Order.aggregate(pipeline);
    const orders = result?.orders || [];
    const total = result?.total?.[0]?.count || 0;

    return res.status(200).json({
      success: true,
      data: { orders, total, page, limit },
      message: "Orders fetched",
    });
  } catch (error) {
    console.error("list orders error:", error);
    return res.status(500).json({ success: false, data: null, message: "Server error" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const normalized = normalizeStatus(req.body.status);

    if (!normalized) {
      return res.status(400).json({ success: false, data: null, message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(id, { orderStatus: normalized }, { new: true });

    if (!order) {
      return res.status(404).json({ success: false, data: null, message: "Order not found" });
    }

    await logActivity({
      actor: req.user,
      action: `changed order status to "${normalized}"`,
      target: "order",
      targetId: order._id,
    });

    return res.status(200).json({ success: true, data: order, message: "Order status updated" });
  } catch (error) {
    console.error("update order status error:", error);
    return res.status(500).json({ success: false, data: null, message: "Server error" });
  }
};

export const getActivityLog = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 20, 1);

    const [logs, total] = await Promise.all([
      ActivityLog.find().sort({ timestamp: -1 }).skip((page - 1) * limit).limit(limit),
      ActivityLog.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      data: { logs, total, page, limit },
      message: "Activity log fetched",
    });
  } catch (error) {
    console.error("activity log error:", error);
    return res.status(500).json({ success: false, data: null, message: "Server error" });
  }
};

export const lowStockProducts = async (req, res) => {
  try {
    const threshold = Math.max(parseInt(req.query.threshold) || 5, 0);

    const products = await Product.find({ stock: { $lte: threshold } })
      .populate("category")
      .sort({ stock: 1 });

    return res.status(200).json({
      success: true,
      data: products,
      message: "Low stock products fetched",
    });
  } catch (error) {
    console.error("low stock products error:", error);
    return res.status(500).json({ success: false, data: null, message: "Server error" });
  }
};
