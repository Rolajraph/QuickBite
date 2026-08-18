import mongoose from "mongoose";
import { ORDER_STATUS, PAYMENT_METHODS } from "../constants/orderStatus.js";

const orderItemSchema = new mongoose.Schema(
  {
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true,
    },
    name: {
      type: String,
      required: true, // snapshot at time of order — never changes retroactively
    },
    price: {
      type: Number,
      required: true, // snapshot at time of order
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
  },
  { _id: false }, // these are sub-documents, don't need their own _id
);

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "Order must contain at least one item",
      },
    },
    deliveryAddress: {
      type: String,
      required: [true, "Delivery address is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHODS),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    paystackReference: {
      type: String,
      unique: true,
      sparse: true,
    },
    
  },
  {
    timestamps: true,
  },
);

// Index for fetching a customer's own order history quickly
orderSchema.index({ customer: 1, createdAt: -1 });

// Index for admin dashboard filtering by status
orderSchema.index({ status: 1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
