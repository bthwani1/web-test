import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';
import { connect, disconnect } from '../db.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

describe('Auth Routes', () => {
  beforeAll(async () => {
    await connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rahla-test');
  });

  afterAll(async () => {
    await User.deleteMany({});
    await disconnect();
  });

  describe('POST /auth/register-initial', () => {
    it('should create first owner user', async () => {
      const userData = {
        name: 'Test Owner',
        email: 'owner@test.com',
        password: 'TestPass123'
      };

      const response = await request(app)
        .post('/auth/register-initial')
        .send(userData)
        .expect(200);

      expect(response.body.ok).toBe(true);
      expect(response.body.id).toBeDefined();
    });

    it('should reject second registration', async () => {
      const userData = {
        name: 'Another Owner',
        email: 'another@test.com',
        password: 'TestPass123'
      };

      await request(app)
        .post('/auth/register-initial')
        .send(userData)
        .expect(403);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'owner@test.com',
        password: 'TestPass123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('owner@test.com');
      expect(response.body.user.role).toBe('owner');
    });

    it('should reject invalid credentials', async () => {
      const loginData = {
        email: 'owner@test.com',
        password: 'WrongPass'
      };

      await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);
    });
  });

  describe('GET /auth/me', () => {
    let authToken;

    beforeAll(async () => {
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'owner@test.com',
          password: 'TestPass123'
        });
      authToken = loginResponse.body.token;
    });

    it('should return user info with valid token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.user.email).toBe('owner@test.com');
      expect(response.body.user.role).toBe('owner');
    });

    it('should reject request without token', async () => {
      await request(app)
        .get('/auth/me')
        .expect(401);
    });
  });
});
