import Order from "../models/order.js";

const normalizePaymentMethod = (paymentMethod) => {
  const value = (paymentMethod || "COD").toString().trim().toLowerCase();

  if (["online", "online payment", "card", "upi", "qr", "wallet"].includes(value)) {
    return "ONLINE";
  }

  return "COD";
};

export const orderplace = async (req, res) => {
  try {
    const payload = req.body?.order || req.body;
    const { items, address, totalAmount, paymentMethod, paymentStatus } = payload;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items are required!",
      });
    }

    if (!address || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Address and total amount are required!",
      });
    }

    const normalizedPaymentMethod = normalizePaymentMethod(paymentMethod);
    const normalizedPaymentStatus = paymentStatus || (normalizedPaymentMethod === "ONLINE" ? "paid" : "pending");

    const formattedItems = items.map((item) => ({
      productId: item.productId,
      name: item.name || "Product",
      price: item.price || 0,
      quantity: item.quantity || 1,
      image: item.image || "",
    }));

    const order = await Order.create({
      user: userId,
      items: formattedItems,
      address,
      totalAmount,
      paymentMethod: normalizedPaymentMethod,
      paymentStatus: normalizedPaymentStatus,
      orderStatus: "placed",
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order,
    });
  } catch (error) {
    console.error("order error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, user: userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.orderStatus !== "placed") {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled once it is ${order.orderStatus}`,
      });
    }

    order.orderStatus = "cancelled";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    console.error("cancel order error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const showOrder = async (req, res) => {
  try {
    const userId = req.user.id;



    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: orders,
    });

  } catch (error) {
    console.error("Show order error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};