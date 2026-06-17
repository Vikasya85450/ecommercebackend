import GiftCard from "../models/giftcard.js";

export const createGiftCard = async (req, res) => {
  try {
    const gift = await GiftCard.create(req.body);

    res.json({
      status: true,
      message: "Gift card saved",
      gift
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

 export const getGiftCard = async (req, res) => {
  try {
    const gift = await GiftCard.find(req.body);

    res.json({
      status: true,
      message: "Gift card saved",
      gift
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};