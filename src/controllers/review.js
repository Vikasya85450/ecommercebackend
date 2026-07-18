import Review from "../models/review.js";

export const postreview = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    const reviewData = req.body.review || req.body;
    const { product, rating, comment } = reviewData;

    if (!product || !rating || !comment) {
      return res.status(400).json({
        status: "error",
        message: "Product, rating and comment are required",
      });
    }

    const newReview = new Review({
      rating,
      comment,
      user: userId,
      product,
    });

    await newReview.save();

    return res.status(201).json({
      status: true,
      message: "Review created",
      review: newReview,
    });
  } catch (error) {
    console.error("post error:", error);
    res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};

export const updateReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user?.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        status: "error",
        message: "Review not found",
      });
    }

    if (review.user.toString() !== userId) {
      return res.status(403).json({
        status: "error",
        message: "You can only edit your own review",
      });
    }

    const { rating, comment } = req.body.review || req.body;

    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save();

    return res.status(200).json({
      status: true,
      message: "Review updated",
      review,
    });
  } catch (error) {
    console.error("update review error:", error);
    res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user?.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        status: "error",
        message: "Review not found",
      });
    }

    if (review.user.toString() !== userId) {
      return res.status(403).json({
        status: "error",
        message: "You can only delete your own review",
      });
    }

    await review.deleteOne();

    return res.status(200).json({
      status: true,
      message: "Review deleted",
    });
  } catch (error) {
    console.error("delete review error:", error);
    res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};

export const getreview = async (req, res) => {
  try {
    const review = await Review.find()
      .populate("user", "name")
      .lean();

    return res.status(200).json({
      status: true,
      message: "All reviews fetched",
      review,
    });
  } catch (error) {
    console.log("🔥 ERROR:", error);

    res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};