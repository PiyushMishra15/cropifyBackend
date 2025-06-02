const Order = require("../models/orderSchema");
const { decreaseProductStocks } = require("../utils/productUtils");

// Place a new order
exports.addOrder = async (req, res) => {
  try {
    const orders = req.body;

    const userId = req.userId;

    // Check orders variable is an array
    if (!Array.isArray(orders)) {
      return res.status(400).send({ message: "Invalid orders data" });
    }

    for (const order of orders) {
      order.userId = userId;

      let data = Order(order);
      let result = await data.save();
      console.log(result);
      await decreaseProductStocks(data.productId, data.orderQty);
    }

    res.status(200).send({ message: `All orders successfully received` });
  } catch (error) {
    res.status(500).send("Something went wrong!");
    console.log(error);
  }
};

exports.showOrdersBySeller = async (req, res) => {
  try {
    let data = await Order.find({ sellerId: req.sellerId })
      .populate({
        path: "productId",
        select:
          "image category name measuringUnit pricePerUnit  minimumOrderQuantity location   deliveryRadius",
      })
      .populate({ path: "userId", select: "name email contact" })
      .lean();

    data = data
      .filter((order) => order.productId)
      .filter(
        (order) =>
          order.orderLocation.coordinates[0] &&
          order.orderLocation.coordinates[1]
      )
      .map((order) => {
        const totalPrice = order.orderQty * order.productId?.pricePerUnit;
        return { ...order, totalAmount: totalPrice };
      });

    res.status(200).send(data);
  } catch (error) {
    res.status(500).send("Something went wrong!");
    console.log(error);
  }
};
