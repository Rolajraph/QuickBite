import { test, describe, before, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import supertest from 'supertest';
import app from '../app.js';
import { connectTestDB, closeTestDB, clearCollections } from './setup.js';

const request = supertest(app);

describe('Auth', () => {
  before(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearCollections();
  });

  after(async () => {
    await closeTestDB();
  });

  test('registers a new user and returns a token', async () => {
    const res = await request.post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.user.role, 'customer');
    assert.ok(res.body.data.token);
    assert.strictEqual(res.body.data.user.password, undefined);
  });

  test('rejects registration with a duplicate email', async () => {
    await request.post('/api/auth/register').send({
      name: 'Test User',
      email: 'dupe@example.com',
      password: 'password123',
    });

    const res = await request.post('/api/auth/register').send({
      name: 'Another User',
      email: 'dupe@example.com',
      password: 'password456',
    });

    assert.strictEqual(res.status, 409);
  });

  test('rejects registration with an invalid password', async () => {
    const res = await request.post('/api/auth/register').send({
      name: 'Test User',
      email: 'test2@example.com',
      password: 'short',
    });

    assert.strictEqual(res.status, 400);
    assert.ok(res.body.errors.length > 0);
  });

  test('logs in with correct credentials', async () => {
    await request.post('/api/auth/register').send({
      name: 'Test User',
      email: 'login@example.com',
      password: 'password123',
    });

    const res = await request.post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'password123',
    });

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.data.token);
  });

  test('logs in with a mixed-case email', async () => {
    await request.post('/api/auth/register').send({
      name: 'Test User',
      email: 'mixedcase@example.com',
      password: 'password123',
    });

    const res = await request.post('/api/auth/login').send({
      email: 'MiXeDCase@Example.com',
      password: 'password123',
    });

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.data.token);
  });

  test('rejects login with wrong password', async () => {
    await request.post('/api/auth/register').send({
      name: 'Test User',
      email: 'login2@example.com',
      password: 'password123',
    });

    const res = await request.post('/api/auth/login').send({
      email: 'login2@example.com',
      password: 'wrongpassword',
    });

    assert.strictEqual(res.status, 401);
  });

  test('rejects profile access without a token', async () => {
    const res = await request.get('/api/auth/profile');
    assert.strictEqual(res.status, 401);
  });

  test('returns profile data with a valid token', async () => {
    const registerRes = await request.post('/api/auth/register').send({
      name: 'Test User',
      email: 'profile@example.com',
      password: 'password123',
    });

    const token = registerRes.body.data.token;

    const res = await request
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.user.email, 'profile@example.com');
  });
});