import Order from '../models/Order.js';
import Food from '../models/Food.js';
import ApiError from '../utils/ApiError.js';
import { ALLOWED_TRANSITIONS } from '../constants/orderStatus.js';

export const createOrder = async (customerId, orderData) => {
  const { items, deliveryAddress, phone, paymentMethod, paystackReference } = orderData;

  const foodIds = items.map((item) => item.food);
  const foods = await Food.find({ _id: { $in: foodIds } });

  if (foods.length !== foodIds.length) {
    throw new ApiError(400, 'One or more food items no longer exist');
  }

  const foodMap = new Map(foods.map((food) => [food._id.toString(), food]));

  let totalAmount = 0;
  const snapshottedItems = items.map(({ food: foodId, quantity }) => {
    const food = foodMap.get(foodId);

    if (!food.isAvailable) {
      throw new ApiError(400, `${food.name} is currently unavailable`);
    }

    const itemTotal = food.price * quantity;
    totalAmount += itemTotal;

    return {
      food: food._id,
      name: food.name,
      price: food.price,
      quantity,
    };
  });

  const orderPayload = {
    customer: customerId,
    items: snapshottedItems,
    deliveryAddress,
    phone,
    paymentMethod,
    totalAmount,
  };

  // Card payments are only created after Paystack verification confirms success
  if (paymentMethod === 'card') {
    orderPayload.paymentStatus = 'paid';
    orderPayload.paystackReference = paystackReference;
  }

  const order = await Order.create(orderPayload);

  return order;
};


export const getMyOrders = async (customerId) => {
  return Order.find({ customer: customerId }).sort({ createdAt: -1 });
};

export const getAllOrders = async () => {
  return Order.find().populate('customer', 'name email').sort({ createdAt: -1 });
};

export const getOrderById = async (orderId, requestingUser) => {
  const order = await Order.findById(orderId).populate('customer', 'name email');

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (!order.customer && requestingUser.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to view this order');
  }

  // Customers can only view their own orders; admins can view any
  const isOwner = order.customer && order.customer._id.toString() === requestingUser.id;
  if (!isOwner && requestingUser.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to view this order');
  }

  return order;
};

export const updateOrderStatus = async (orderId, newStatus) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const allowedNextStatuses = ALLOWED_TRANSITIONS[order.status];

  if (!allowedNextStatuses.includes(newStatus)) {
    throw new ApiError(
      400,
      `Cannot change status from '${order.status}' to '${newStatus}'`
    );
  }

  order.status = newStatus;
  await order.save();

  return order;
};