import request from 'supertest';
import app from '../app';

const createUniqueUser = () => {
  const suffix = `${Date.now()}${Math.random().toString(16).slice(2)}`;
  return {
    username: `user-${suffix}`,
    email: `user-${suffix}@example.com`,
    password: 'password123',
  };
};

describe('Auth Routes', () => {

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const testUser = createUniqueUser();
      const res = await request(app).post('/auth/register').send(testUser);
      expect(res.status).toBe(201);
      expect(res.body.user.username).toBe(testUser.username);
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    it('should fail with missing fields', async () => {
      const res = await request(app).post('/auth/register').send({ username: 'test' });
      expect(res.status).toBe(400);
    });

    it('should fail with duplicate email', async () => {
      const testUser = createUniqueUser();
      await request(app).post('/auth/register').send(testUser);
      const res = await request(app).post('/auth/register').send(testUser);
      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const testUser = createUniqueUser();
      await request(app).post('/auth/register').send(testUser);
      const res = await request(app).post('/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });
      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    it('should fail with wrong password', async () => {
      const testUser = createUniqueUser();
      await request(app).post('/auth/register').send(testUser);
      const res = await request(app).post('/auth/login').send({
        email: testUser.email,
        password: 'wrongpassword',
      });
      expect(res.status).toBe(401);
    });

    it('should fail with non-existent email', async () => {
      const res = await request(app).post('/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'password123',
      });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully', async () => {
      const testUser = createUniqueUser();
      const registerRes = await request(app).post('/auth/register').send(testUser);
      const { accessToken, refreshToken } = registerRes.body;

      const res = await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Logout successful');
    });

    it('should fail without access token', async () => {
      const res = await request(app).post('/auth/logout').send({ refreshToken: 'sometoken' });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh tokens', async () => {
      const testUser = createUniqueUser();
      const registerRes = await request(app).post('/auth/register').send(testUser);
      const { refreshToken } = registerRes.body;

      const res = await request(app).post('/auth/refresh').send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    it('should fail with invalid refresh token', async () => {
      const res = await request(app).post('/auth/refresh').send({ refreshToken: 'invalidtoken' });
      expect(res.status).toBe(401);
    });
  });
});
