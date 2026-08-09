import { test, describe, before, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import supertest from 'supertest';
import app from '../app.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Food from '../models/Food.js';
import { connectTestDB, closeTestDB, clearCollections } from './setup.js';

const request = supertest(app);

const registerAndLogin = async (role = 'customer') => {
  const email = `${role}-${Date.now()}-${Math.random()}@example.com`;
  const res = await request.post('/api/auth/register').send({
    name: 'Test User',
    email,
    password: 'password123',
  });

  if (role === 'admin') {
    await User.findByIdAndUpdate(res.body.data.user.id, { role: 'admin' });
    const loginRes = await request.post('/api/auth/login').send({
      email,
      password: 'password123',
    });
    return loginRes.body.data.token;
  }

  return res.body.data.token;
};

describe('Orders', () => {
  let foodId;
  let foodPrice;

  before(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearCollections();
    const category = await Category.create({ name: 'Test Category' });
    const food = await Food.create({
      name: 'Test Jollof Rice',
      description: 'Test food',
      price: 3000,
      category: category._id,
    });
    foodId = food._id.toString();
    foodPrice = food.price;
  });

  after(async () => {
    await closeTestDB();
  });

  test('creates an order with server-calculated total', async () => {
    const token = await registerAndLogin('customer');

    const res = await request
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ food: foodId, quantity: 2 }],
        deliveryAddress: '123 Test Street',
        phone: '08000000000',
        paymentMethod: 'cash_on_delivery',
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.data.order.totalAmount, foodPrice * 2);
    assert.strictEqual(res.body.data.order.items[0].price, foodPrice);
    assert.strictEqual(res.body.data.order.status, 'pending');
  });

  test('ignores a client-submitted price and recalculates from the database', async () => {
    const token = await registerAndLogin('customer');

    const res = await request
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ food: foodId, quantity: 1, price: 1 }], // attempted price manipulation
        deliveryAddress: '123 Test Street',
        phone: '08000000000',
        paymentMethod: 'cash_on_delivery',
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.data.order.totalAmount, foodPrice);
  });

  test('rejects order creation without authentication', async () => {
    const res = await request.post('/api/orders').send({
      items: [{ food: foodId, quantity: 1 }],
      deliveryAddress: '123 Test Street',
      phone: '08000000000',
      paymentMethod: 'cash_on_delivery',
    });

    assert.strictEqual(res.status, 401);
  });

  test('customer can only see their own orders, not all orders', async () => {
    const token = await registerAndLogin('customer');

    const res = await request
      .get('/api/orders')
      .set('Authorization', `Bearer ${token}`);

    assert.strictEqual(res.status, 403);
  });

  test('admin can list all orders', async () => {
    const customerToken = await registerAndLogin('customer');
    await request
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ food: foodId, quantity: 1 }],
        deliveryAddress: '123 Test Street',
        phone: '08000000000',
        paymentMethod: 'cash_on_delivery',
      });

    const adminToken = await registerAndLogin('admin');
    const res = await request
      .get('/api/orders')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.results, 1);
  });

  test('allows a legal status transition', async () => {
    const customerToken = await registerAndLogin('customer');
    const orderRes = await request
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ food: foodId, quantity: 1 }],
        deliveryAddress: '123 Test Street',
        phone: '08000000000',
        paymentMethod: 'cash_on_delivery',
      });

    const orderId = orderRes.body.data.order._id;
    const adminToken = await registerAndLogin('admin');

    const res = await request
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'preparing' });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.order.status, 'preparing');
  });

  test('rejects an illegal status transition', async () => {
    const customerToken = await registerAndLogin('customer');
    const orderRes = await request
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ food: foodId, quantity: 1 }],
        deliveryAddress: '123 Test Street',
        phone: '08000000000',
        paymentMethod: 'cash_on_delivery',
      });

    const orderId = orderRes.body.data.order._id;
    const adminToken = await registerAndLogin('admin');

    const res = await request
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'delivered' }); // pending -> delivered is illegal, must go through preparing/on_the_way first

    assert.strictEqual(res.status, 400);
  });
});