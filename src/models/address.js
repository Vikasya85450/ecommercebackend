import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    phone: {
      type: String, // Better as String to preserve leading zeros
      required: true,
    },

    pincode: {
      type: String, // Better as String
      required: true,
    },

    house: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    street: {
      type: String,
      required: true,
    },

    landmark: {
      type: String,
    },

    type: {
      type: String,
      enum: ["home", "office"],
      default: "home",
    },
  },
  {
    timestamps: true,
  }
);

const Address = mongoose.model("Address", addressSchema);

export default Address;