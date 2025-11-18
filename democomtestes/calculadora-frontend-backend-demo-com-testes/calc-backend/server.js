/**
 * Calc Backend - ExpressJS (com suporte a testes Jasmine + Supertest)
 * Endpoints:
 *  POST /api/calc  -> { op: "add"|"sub"|"mul"|"div"|"pow", a: number, b: number }
 *  GET  /api/health -> retorna {status:"ok"}
 */
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.post('/api/calc', (req, res) => {
  try {
    const { op, a, b } = req.body || {};
    const A = Number(a);
    const B = Number(b);

    if (!['add', 'sub', 'mul', 'div', 'pow'].includes(op)) {
      return res.status(400).json({ error: 'Operação inválida. Use add, sub, mul, div ou pow.' });
    }
    if (!Number.isFinite(A) || !Number.isFinite(B)) {
      return res.status(400).json({ error: 'Parâmetros a e b devem ser números válidos.' });
    }
    if (op === 'div' && B === 0) {
      return res.status(400).json({ error: 'Divisão por zero não é permitida.' });
    }

    let result;
    switch (op) {
      case 'add': result = A + B; break;
      case 'sub': result = A - B; break;
      case 'mul': result = A * B; break;
      case 'div': result = A / B; break;
      case 'pow': result = Math.pow(A, B); break;
    }
    const expression = `${A} ${opSymbol(op)} ${B}`;
    res.json({ result, expression });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

function opSymbol(op){
  return { add: '+', sub: '-', mul: '×', div: '÷', pow: '^' }[op] || '?';
}

// Só inicia o servidor se este arquivo for executado diretamente (não durante testes)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Calc backend rodando em http://localhost:${PORT}`);
  });
}

module.exports = app;
