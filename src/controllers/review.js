import Review from "../models/review.js";


export const postreview =async (req,res)=>{
const {userId,product,rating,comment} = req.body.review;

try {
    
const newReview = await new Review({
    rating:rating,
    comment:comment,
    user:userId,
    product:product
})
 newReview.save();
return res.status(201).json({
      status: true,
      message: "review Created !!!",
      newReview
    })


} catch (error) {
    
    console.error("post error:", error);
    res.status(500).json({
      status: "error",
      message: "Server error"
    });
    
}
}


export const getreview = async (req, res) => {
  try {
    const review = await Review.find()
      .populate("user", "name") // ✅ FIXED
      .lean();

    return res.status(200).json({
      status: true,
      message: "all review fetched !!!",
      review
    });

  } catch (error) {
    console.log("🔥 ERROR:", error);

    res.status(500).json({
      status: "error",
      message: "Server error"
    });
  }
};