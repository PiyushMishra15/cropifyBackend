const Order = require("../models/orderSchema");
const {
  getDateVsSalesData,
  getCategoryVsSalesData,
} = require("../utils/orderServices");

const getGraphData = async (req, res) => {
  try {
    let orders = await Order.find({ sellerId: req.sellerId })
      .select("-sellerId -orderLocation -userId")
      .populate({
        path: "productId",
        select: "category pricePerUnit",
      })
      .lean();

    const dateVsSales = getDateVsSalesData(orders) || [];
    const categoryVsSales = getCategoryVsSalesData(orders) || [];

    res.status(200).send({
      dateVsSales: Array.isArray(dateVsSales) ? dateVsSales : [],
      categoryVsSales: Array.isArray(categoryVsSales) ? categoryVsSales : [],
    });
  } catch (error) {
    console.error("getGraphData error:", error);
    res.status(500).send("Something went wrong!");
  }
};

module.exports = { getGraphData };
