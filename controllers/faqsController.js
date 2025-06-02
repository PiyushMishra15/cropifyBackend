const FAQ = require("../models/faqsSchema");

const Product = require("../models/productSchema"); // Make sure to import your Product model

const addFAQ = async (req, res) => {
  try {
    console.log("User ID:", req.userId);
    const { productId } = req.params;

    // Fetch the product to get the sellerId
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send({ message: "Product not found." });
    }

    // Add required fields
    req.body.userId = req.userId;
    req.body.productId = productId;
    req.body.sellerId = product.sellerId; // ✅ this was missing

    // Save FAQ
    const data = new FAQ(req.body);
    const result = await data.save();

    console.log("Saved FAQ:", result);

    res.status(200).send({
      message:
        "After the seller answers your question, we will send you an email to inform you.",
    });
  } catch (error) {
    console.log("FAQ Error:", error);
    if (
      error.code === 11000 &&
      error.keyPattern?.userId &&
      error.keyPattern?.productId
    ) {
      res.status(400).send({
        message: "You have already submitted a question for this product.",
      });
    } else {
      res.status(500).send({ message: "Something went wrong!" });
    }
  }
};

// Answering FAQ by Seller
const ansFAQ = async (req, res) => {
  try {
    let data = await FAQ.findByIdAndUpdate(req.params.faqId, {
      answer: req.body.answer,
      isAnswered: true,
    });
    res.status(200).send({
      message: "Answered Successfully",
    });
  } catch (error) {
    res.status(500).send({ message: "Something went wrong!" });
    console.log(error);
  }
};

// Show Paginated FAQs by Product ID
const showFAQsbyProduct = async (req, res) => {
  try {
    let page = req.query.page;
    let faq_per_page = req.query.faq_per_page;

    let skip = (page - 1) * faq_per_page;

    let data = await FAQ.find({
      productId: req.params.productId,
      isAnswered: true,
    })
      .sort({ date: -1 })
      .skip(skip)
      .limit(faq_per_page)
      .select("question answer")
      .lean();
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send({ message: "Something went wrong!" });
    console.log(error);
  }
};

// Show FAQs by Seller ID
const showFAQsbySeller = async (req, res) => {
  try {
    let sellerId = req.sellerId;

    let data = await FAQ.find({
      sellerId: sellerId,
      isAnswered: req.query.isAnswered,
    })
      .sort({ date: -1 })
      .select("question answer productId")
      .lean();
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send({ message: "Something went wrong!" });
    console.log(error);
  }
};

module.exports = {
  addFAQ,
  showFAQsbyProduct,
  showFAQsbySeller,
  ansFAQ,
};
