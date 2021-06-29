const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      uppercase: true,
      unique: true,
      required: "Name is required",
      minlength: [6, "Too short"],
      maxlength: [12, "Too long"],
    },
    expiry: {
      type: Date,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
