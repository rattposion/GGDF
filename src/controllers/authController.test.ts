import request from 'supertest';
import express from 'express';
import authRoutes from '../src/routes/auth';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Endpoints', () => {
  it('deve registrar um novo usuário', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: '123456', name: 'Test' });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('token');
  });

  it('deve fazer login com usuário registrado', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'login@example.com', password: '123456', name: 'Login' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: '123456' });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('token');
  });
}); 