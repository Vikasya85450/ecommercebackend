import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: Number,
    required: true
  },
  pincode: {
    type: Number,
    required: true
  },
  house: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  street: {
    type: String,
    required: true
  },
  landmark: {
    type: String
  },
  type: {
    type: String,
    enum: ["home", "office"],
    default: "home"
  }
}, { timestamps: true });

const Address = mongoose.model("Address", addressSchema);

export default Address;