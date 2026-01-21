import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import User from '../models/user';

const TEST_DB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/web_dev_test';

beforeAll(async () => {
  await mongoose.connect(TEST_DB_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Users Routes', () => {
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
  };

  let accessToken: string;
  let userId: string;

  beforeEach(async () => {
    const res = await request(app).post('/auth/register').send(testUser);
    accessToken = res.body.accessToken;
    userId = res.body.user._id;
  });

  describe('GET /user', () => {
    it('should get all users', async () => {
      const res = await request(app)
        .get('/user')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].password).toBeUndefined();
    });

    it('should fail without auth', async () => {
      const res = await request(app).get('/user');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /user/:id', () => {
    it('should get user by id', async () => {
      const res = await request(app)
        .get(`/user/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body.username).toBe(testUser.username);
      expect(res.body.password).toBeUndefined();
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/user/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /user/:id', () => {
    it('should update own profile', async () => {
      const res = await request(app)
        .put(`/user/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ username: 'updateduser', email: 'updated@example.com' });
      expect(res.status).toBe(200);
      expect(res.body.username).toBe('updateduser');
    });

    it('should fail to update other user profile', async () => {
      const otherUser = await request(app).post('/auth/register').send({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'password123',
      });
      const otherId = otherUser.body.user._id;

      const res = await request(app)
        .put(`/user/${otherId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ username: 'hacked' });
      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /user/:id', () => {
    it('should delete own profile', async () => {
      const res = await request(app)
        .delete(`/user/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
    });

    it('should fail to delete other user profile', async () => {
      const otherUser = await request(app).post('/auth/register').send({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'password123',
      });
      const otherId = otherUser.body.user._id;

      const res = await request(app)
        .delete(`/user/${otherId}`)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(403);
    });
  });
});
