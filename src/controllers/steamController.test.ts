import request from 'supertest';
import express from 'express';
import steamRoutes from '../routes/steam';

const app = express();
app.use(express.json());
app.use('/api/steam', steamRoutes);

describe('Steam Endpoints', () => {
  it('deve retornar erro de autenticação ao buscar inventário sem token', async () => {
    const res = await request(app).get('/api/steam/inventory/123');
    expect(res.statusCode).toBe(401);
  });

  it('deve retornar erro de autenticação ao importar itens sem token', async () => {
    const res = await request(app).post('/api/steam/import').send({ steamId: '123', items: ['1'] });
    expect(res.statusCode).toBe(401);
  });

  it('deve limitar requisições à Steam API', async () => {
    for (let i = 0; i < 10; i++) {
      await request(app).get('/api/steam/price/AK-47%20Redline');
    }
    const res = await request(app).get('/api/steam/price/AK-47%20Redline');
    expect(res.statusCode).toBe(429);
    expect(res.body).toHaveProperty('error');
  });
}); 