const request = require('supertest');
const app = require('../server'); // importa o app sem subir servidor

describe('API /api/calc', () => {
  it('deve somar corretamente', async () => {
    const res = await request(app)
      .post('/api/calc')
      .send({ op: 'add', a: 10, b: 5 })
      .expect(200);
    expect(res.body.result).toBe(15);
    expect(res.body.expression).toContain('+');
  });

  it('deve dividir corretamente', async () => {
    const res = await request(app)
      .post('/api/calc')
      .send({ op: 'div', a: 9, b: 3 })
      .expect(200);
    expect(res.body.result).toBe(3);
    expect(res.body.expression).toContain('÷');
  });

  it('deve retornar 400 para divisão por zero', async () => {
    const res = await request(app)
      .post('/api/calc')
      .send({ op: 'div', a: 10, b: 0 })
      .expect(400);
    expect(res.body.error).toContain('Divisão por zero');
  });

  it('deve retornar 400 para operação inválida', async () => {
    const res = await request(app)
      .post('/api/calc')
      .send({ op: 'xyz', a: 1, b: 2 })
      .expect(400);
    expect(res.body.error).toContain('Operação inválida');
  });

  it('deve responder ao healthcheck', async () => {
    const res = await request(app).get('/api/health').expect(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.time).toBeDefined();
  });
});
