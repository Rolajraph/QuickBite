import { test, describe, before, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import supertest from 'supertest';
import app from '../app.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import { connectTestDB, closeTestDB, clearCollections } from './setup.js';

const request = supertest(app);

const registerAndLogin = async (role = 'customer') => {
  const email = `${role}-${Date.now()}@example.com`;
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

describe('Foods', () => {
  let categoryId;

  before(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearCollections();
    const category = await Category.create({ name: 'Test Category' });
    categoryId = category._id.toString();
  });

  after(async () => {
    await closeTestDB();
  });

  test('lists foods publicly with no auth required', async () => {
    const res = await request.get('/api/foods');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.data.foods));
  });

  test('rejects food creation from a non-admin user', async () => {
    const token = await registerAndLogin('customer');

    const res = await request
      .post('/api/foods')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Jollof Rice',
        description: 'Test food',
        price: 2000,
        category: categoryId,
      });

    assert.strictEqual(res.status, 403);
  });

  test('rejects food creation with a non-existent category', async () => {
    const token = await registerAndLogin('admin');
    const fakeId = '000000000000000000000000';

    const res = await request
      .post('/api/foods')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Jollof Rice',
        description: 'Test food',
        price: 2000,
        category: fakeId,
      });

    assert.strictEqual(res.status, 400);
  });

  test('allows an admin to create a food with a valid category', async () => {
    const token = await registerAndLogin('admin');

    const res = await request
      .post('/api/foods')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Jollof Rice',
        description: 'Test food',
        price: 2000,
        category: categoryId,
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.data.food.category.name, 'Test Category');
  });

  test('updates a food with partial data', async () => {
    const token = await registerAndLogin('admin');

    const createRes = await request
      .post('/api/foods')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Jollof Rice',
        description: 'Test food',
        price: 2000,
        category: categoryId,
      });

    const foodId = createRes.body.data.food._id;

    const updateRes = await request
      .put(`/api/foods/${foodId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ price: 2500 });

    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateRes.body.data.food.price, 2500);
    assert.strictEqual(updateRes.body.data.food.name, 'Jollof Rice');
  });

  test('deletes a food', async () => {
    const token = await registerAndLogin('admin');

    const createRes = await request
      .post('/api/foods')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Jollof Rice',
        description: 'Test food',
        price: 2000,
        category: categoryId,
      });

    const foodId = createRes.body.data.food._id;

    const deleteRes = await request
      .delete(`/api/foods/${foodId}`)
      .set('Authorization', `Bearer ${token}`);

    assert.strictEqual(deleteRes.status, 200);

    const getRes = await request.get(`/api/foods/${foodId}`);
    assert.strictEqual(getRes.status, 404);
  });
});