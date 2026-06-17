import Address from "../models/address.js";


export const addAddress = async (req, res) => {
  try {
    const {
      name,
      phone,
      pincode,
      house,
      city,
      street,
      landmark,
      type
    } = req.body;
    
    console.log("req sent");
    
    const address = new Address({
      name,
      phone,
      pincode,
      house,
      city,
      street,
      landmark,
      type
    });

    const savedAddress = await address.save();

    res.status(201).json({
      status: "success",
      message: "Address added successfully",
      data: savedAddress
    });

  } catch (error) {
    console.error("add address error:", error);

    res.status(500).json({
      status: "error",
      message: "Server error"
    });
  }
};

export const getaddress = async (req,res)=>{
    try {
        const address =await Address.find();
        console.log(address);
        
        res.status(200).json({
      status: "success",
      message: "All Category",
      address
    });
    } catch (error) {
        res.status(500).json({
      status: "error",
      message: "Server error"
    });
    }
}