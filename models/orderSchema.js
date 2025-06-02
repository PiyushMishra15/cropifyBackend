const Schema = require("mongoose").Schema;
const orderSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "products",
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "users",
  },
  orderQty: {
    type: Number,
    required: true,
  },
  sellerId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "sellers",
  },
  orderStatus: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected", "Delivered"],
    default: "Pending",
  },
  orderLocation: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
});

orderSchema.index({ productId: 1, userId: 1 }, { unique: true });

module.exports = require("mongoose").model("orders", orderSchema);
