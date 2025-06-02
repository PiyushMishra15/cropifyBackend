const { Schema, model } = require("mongoose");
const sellerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
        },
        messages: "Please enter a valid email address",
      },
    },
    password: {
      type: String,
      required: true,
      min: [6, "Password must be at least 6 characters long"],
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    contact: {
      type: String,
    },
    verifyToken: {
      type: String,
    },
    brandName: {
      type: String,
      required: true,
      unique: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    verificationTokenExpiry: {
      type: Date,
    },
    resetTokenExpiry: {
      type: Date,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    resetToken: {
      type: String,
    },
  },
  { timestamps: true }
);

const sellerModel = model("sellers", sellerSchema);
module.exports = sellerModel;
