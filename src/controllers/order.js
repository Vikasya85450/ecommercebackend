import Order from "../models/order.js";

export const orderplace = async (req, res) => {
  try {
    const { items, address, totalAmount, paymentMethod, paymentStatus } = req.body;
   
    

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
      userId: req.user?.id || "65f1a2b3c4d5e6f789012300",
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

export const showOrder = async (req ,res)=>{
try {

    const order = await Order.find();
    // const orders = await Order.find({ userId }).populate("items.productId");

     res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });

    
} 
}