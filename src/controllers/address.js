import Address from "../models/address.js";


export const addAddress = async (req, res) => {
  try {
    const userId = req.user.id;
   
    

    const {
      name,
      phone,
      pincode,
      house,
      city,
      street,
      landmark,
      type,
    } = req.body;

    const address = await Address.create({
      user: userId, // Save the logged-in user
      name,
      phone,
      pincode,
      house,
      city,
      street,
      landmark,
      type,
    });

    return res.status(201).json({
      status: "success",
      message: "Address added successfully",
      address,
    });
  } catch (error) {
    console.error("Add address error:", error);

    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};

export const getaddress = async (req, res) => {
  try {
    const userId = req.user.id;

    
const address = await Address.find({ user: req.user.id });
    res.status(200).json({
      status: "success",
      message: "Addresses fetched successfully",
      address,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};