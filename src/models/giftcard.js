import mongoose from "mongoose";

const giftCardSchema = new mongoose.Schema({
  senderName: String,
  receiverEmail: String,
  message: String,
  amount: Number,
  design: String, // image URL
}, { timestamps: true });

export default mongoose.model("GiftCard", giftCardSchema);