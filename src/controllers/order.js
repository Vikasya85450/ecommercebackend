import Order from "../models/order.js";

export const orderplace = async (req, res) => {
  try {
    const { items, address, totalAmount, paymentMethod, paymentStatus } = req.body;
     const userId = req.user.id;
     console.log(id);
     
    
    

    // ✅ Validation
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items are required!",
      });
    }

    if (!address || !totalAmount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "All fields are required!",
      });
    }

    // ✅ Store items with image (no upload)
    const formattedItems = items.map((item) => ({
      productId: item.productId,

      name: item.name || "Product",
      price: item.price || 0,
      quantity: item.quantity || 1,
      image: item.image || "", // 🔥 directly store Cloudinary URL
    }));

    const order = await Order.create({
     user: userId ,
      items: formattedItems,
      address,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentStatus || "pending",
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