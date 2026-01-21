import request from 'supertest';
import app from '../app';

const createAuthToken = async () => {
  const uniqueId = `${Date.now()}${Math.random().toString(16).slice(2)}`;
  const res = await request(app)
    .post('/auth/register')
    .send({
      username: `user-${uniqueId}`,
      email: `user-${uniqueId}@example.com`,
      password: 'Password123'
    });
  return res.body.accessToken;
};

describe('posts routes', () => {
  it('creates a post when authenticated', async () => {
    const token = await createAuthToken();
    const response = await request(app)
      .post('/post')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'New Post',
        content: 'Protected content'
      });
    expect(response.status).toBe(201);
    expect(response.body.title).toBe('New Post');
    expect(response.body.sender).toBeTruthy();
  });

  it('rejects creating a post without auth', async () => {
    const response = await request(app).post('/post').send({
      title: 'Fail',
      content: 'No token'
    });
    expect(response.status).toBe(401);
  });

  it('updates a post owned by the user', async () => {
    const token = await createAuthToken();
    const post = await request(app)
      .post('/post')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Draft', content: 'Initial' });
    const updated = await request(app)
      .put(`/post/${post.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated', content: 'Revised' });
    expect(updated.status).toBe(200);
    expect(updated.body.title).toBe('Updated');
  });

  it('prevents updating someone else\'s post', async () => {
    const ownerToken = await createAuthToken();
    const otherToken = await createAuthToken();
    const post = await request(app)
      .post('/post')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Visible', content: 'Owned' });
    const response = await request(app)
      .put(`/post/${post.body._id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ title: 'Hijack', content: 'Nope' });
    expect(response.status).toBe(404);
  });

  it('deletes a post owned by the user', async () => {
    const token = await createAuthToken();
    const post = await request(app)
      .post('/post')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'To Delete', content: 'Remove me' });
    const response = await request(app)
      .delete(`/post/${post.body._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body._id).toBe(post.body._id);
  });
});
