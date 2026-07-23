import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
 
    
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },


  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },
      name: String,
      price: Number,
      quantity: Number,
      image:String,
    }
  ],

  address: {
    name: String,
    phone: String,
    pincode: String,
    house: String,
    city: String,
    street: String,
    landmark: String,
    typeof: String
  },

  totalAmount: {
    type: Number,
    required: true
  },

  paymentMethod: {
    type: String,
    enum: ["COD", "ONLINE"],
    default: "COD"
  },

  orderStatus: {
    type: String,
    enum: ["placed", "shipped", "delivered", "cancelled"],
    default: "placed"
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "paid"],
    default: "pending"
  }

}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;