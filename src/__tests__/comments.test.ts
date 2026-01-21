import request from 'supertest';
import app from '../app';

const createAuthToken = async () => {
  const suffix = `${Date.now()}${Math.random().toString(16).slice(2)}`;
  const res = await request(app)
    .post('/auth/register')
    .send({
      username: `commenter-${suffix}`,
      email: `commenter-${suffix}@example.com`,
      password: 'Password123'
    });
  return res.body.accessToken;
};

const createPost = async (token: string) => {
  const response = await request(app)
    .post('/post')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Commented Post', content: 'Base' });
  return response.body;
};

describe('comments routes', () => {
  it('creates a comment when authenticated', async () => {
    const token = await createAuthToken();
    const post = await createPost(token);
    const response = await request(app)
      .post('/comment')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Nice read', postId: post._id });
    expect(response.status).toBe(201);
    expect(response.body.postId).toBe(post._id);
  });

  it('rejects comment creation without auth', async () => {
    const token = await createAuthToken();
    const post = await createPost(token);
    const response = await request(app)
      .post('/comment')
      .send({ content: 'No auth', postId: post._id });
    expect(response.status).toBe(401);
  });

  it('updates a comment owned by the user', async () => {
    const token = await createAuthToken();
    const post = await createPost(token);
    const comment = await request(app)
      .post('/comment')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'First', postId: post._id });
    const updated = await request(app)
      .put(`/comment/${comment.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Edited' });
    expect(updated.status).toBe(200);
    expect(updated.body.content).toBe('Edited');
  });

  it('prevents updating someone else\'s comment', async () => {
    const ownerToken = await createAuthToken();
    const otherToken = await createAuthToken();
    const post = await createPost(ownerToken);
    const comment = await request(app)
      .post('/comment')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ content: 'Owned', postId: post._id });
    const response = await request(app)
      .put(`/comment/${comment.body._id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ content: 'Hijacked' });
    expect(response.status).toBe(404);
  });

  it('deletes a comment owned by the user', async () => {
    const token = await createAuthToken();
    const post = await createPost(token);
    const comment = await request(app)
      .post('/comment')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'To Delete', postId: post._id });
    const response = await request(app)
      .delete(`/comment/${comment.body._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.comment._id).toBe(comment.body._id);
  });
});
