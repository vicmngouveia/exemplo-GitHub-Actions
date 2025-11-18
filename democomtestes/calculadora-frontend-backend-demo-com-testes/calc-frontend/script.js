(function(){
  const form = document.getElementById('calc-form');
  const inputA = document.getElementById('a');
  const inputB = document.getElementById('b');
  const selectOp = document.getElementById('op');
  const resultCard = document.getElementById('result');
  const expressionEl = document.getElementById('expression');
  const valueEl = document.getElementById('value');
  const errorEl = document.getElementById('error');
  const apiBaseInput = document.getElementById('api-base');
  const pingBtn = document.getElementById('ping');
  const healthOut = document.getElementById('health-out');
  const clearBtn = document.getElementById('clear');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const a = inputA.value;
    const b = inputB.value;
    const op = selectOp.value;
    errorEl.textContent = '';
    valueEl.textContent = '—';
    expressionEl.textContent = '—';

    try {
      const resp = await fetch(`${apiBaseInput.value.replace(/\/+$/,'')}/api/calc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ op, a, b })
      });
      const data = await resp.json();
      resultCard.classList.remove('hidden');
      if (!resp.ok) {
        errorEl.textContent = data?.error || 'Erro na requisição';
        return;
      }
      expressionEl.textContent = data.expression ?? `${a} ${symbol(op)} ${b}`;
      valueEl.textContent = data.result;
    } catch (err) {
      resultCard.classList.remove('hidden');
      errorEl.textContent = 'Falha ao conectar ao backend. Verifique se o servidor está rodando.';
      console.error(err);
    }
  });

  pingBtn.addEventListener('click', async () => {
    healthOut.textContent = 'Testando...';
    try {
      const r = await fetch(`${apiBaseInput.value.replace(/\/+$/,'')}/api/health`);
      const j = await r.json();
      healthOut.textContent = `Status: ${j.status} • ${j.time}`;
    } catch(e){
      healthOut.textContent = 'Falha ao conectar.';
    }
  });

  clearBtn.addEventListener('click', () => {
    inputA.value = '';
    inputB.value = '';
    selectOp.value = 'add';
    resultCard.classList.add('hidden');
    errorEl.textContent = '';
  });

  function symbol(op){
    return { add: '+', sub: '−', mul: '×', div: '÷', pow: '^' }[op] || '?';
  }
})();
