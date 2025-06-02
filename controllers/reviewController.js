const Review = require("../models/reviewSchema");

// Add Review
const addReview = async (req, res) => {
  try {
    const { heading, description, stars } = req.body;
    const userId = req.userId;
    const productId = req.params.productId;
    if (!userId || !productId) {
      return res
        .status(400)
        .send({ message: "User ID and Product ID are required." });
    }

    if (!heading || !description) {
      return res.status(400).send({ message: "feild  are required." });
    }

    const newReview = new Review({
      heading,
      description,
      stars,
      userId,
      productId,
    });
    const result = await newReview.save();

    console.log(result);
    return res.status(200).send({ message: "Review successfully posted" });
  } catch (error) {
    if (
      error.code === 11000 &&
      error.keyPattern &&
      error.keyPattern.userId &&
      error.keyPattern.productId
    ) {
      return res.status(400).send({
        message: "You have already submitted a review for this product.",
      });
    }

    console.error("Error posting review:", error);
    return res.status(500).send({ message: "Something went wrong!" });
  }
};

// Get Paginated Review
const getPaginatedReview = async (req, res) => {
  try {
    const review_per_page = parseInt(req.query.review_per_page) || 10;
    const page = parseInt(req.query.page) || 1;

    const skip = (page - 1) * review_per_page;

    const data = await Review.find({
      productId: req.params.productId,
    })
      .sort({ date: -1 })
      .skip(skip)
      .limit(review_per_page)
      .lean();

    res.status(200).send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong!" });
  }
};

module.exports = {
  addReview,
  getPaginatedReview,
};
