import { z } from 'zod';
import { PAYMENT_METHODS, ORDER_STATUS } from '../constants/orderStatus.js';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID');

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        food: objectId,
        quantity: z.number().int().positive('Quantity must be at least 1'),
      })
    )
    .min(1, 'Order must contain at least one item'),
  deliveryAddress: z.string().trim().min(5, 'Delivery address is too short'),
  phone: z.string().trim().min(7, 'Please provide a valid phone number'),
  paymentMethod: z.enum(Object.values(PAYMENT_METHODS)),
  paystackReference: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(Object.values(ORDER_STATUS)),
});

