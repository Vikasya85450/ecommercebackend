import Review from "../models/review.js";

export const postreview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { rating, comment } = req.body.review || req.body;

    if (!rating || !comment) {
      return res.status(400).json({
        status: "error",
        message: "Rating and comment are required",
      });
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      user: userId,
      product: productId,
    });

    if (existingReview) {
      return res.status(400).json({
        status: "error",
        message: "You have already reviewed this product.",
      });
    }

    const newReview = await Review.create({
      user: userId,
      product: productId,
      rating,
      comment,
    });

    return res.status(201).json({
      status: true,
      message: "Review added successfully",
      review: newReview,
    });
  } catch (error) {
    console.error("Add review error:", error);

    return res.status(500).json({
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
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      status: true,
      message: "Reviews fetched successfully",
      reviews,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};