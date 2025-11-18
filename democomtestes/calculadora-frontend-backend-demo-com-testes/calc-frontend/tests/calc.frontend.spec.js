/**
 * Testes de frontend com Jasmine
 * Estratégia: carregamos a aplicação real (index.html) dentro de um <iframe>
 * e interagimos com o DOM dela. "fetch" é "mockado" no contexto do iframe.
 */
function loadAppIframe() {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.src = '../index.html';
    iframe.onload = () => resolve(iframe);
    iframe.onerror = reject;
    document.body.appendChild(iframe);
  });
}

describe('Frontend - Calculadora', () => {
  let iframe, win, doc;

  beforeAll(async () => {
    iframe = await loadAppIframe();
    win = iframe.contentWindow;
    doc = win.document;
  });

  afterAll(() => {
    if (iframe && iframe.parentNode) iframe.parentNode.removeChild(iframe);
  });

  it('deve renderizar formulário com campos A, B e operação', () => {
    expect(doc.getElementById('a')).toBeTruthy();
    expect(doc.getElementById('b')).toBeTruthy();
    expect(doc.getElementById('op')).toBeTruthy();
    expect(doc.getElementById('calc-form')).toBeTruthy();
  });

  it('deve exibir resultado após cálculo bem-sucedido', async () => {
    // Mock da fetch do IFRAME (não da janela principal)
    spyOn(win, 'fetch').and.callFake(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ result: 42, expression: '37 + 5' })
    }));

    // Preenche o formulário
    doc.getElementById('a').value = '37';
    doc.getElementById('b').value = '5';
    doc.getElementById('op').value = 'add';

    // Submete o formulário
    const form = doc.getElementById('calc-form');
    form.dispatchEvent(new win.Event('submit'));

    // Aguarda o ciclo de microtasks
    await new Promise(r => setTimeout(r));

    const resultCard = doc.getElementById('result');
    const valueEl = doc.getElementById('value');
    const expressionEl = doc.getElementById('expression');
    const errorEl = doc.getElementById('error');

    expect(resultCard.classList.contains('hidden')).toBeFalse();
    expect(errorEl.textContent.trim()).toBe('');
    expect(valueEl.textContent).toBe('42');
    expect(expressionEl.textContent).toBe('37 + 5');
  });

  it('deve exibir mensagem de erro quando backend retorna erro', async () => {
    spyOn(win, 'fetch').and.callFake(() => Promise.resolve({
      ok: false,
      json: () => Promise.resolve({ error: 'Divisão por zero não é permitida.' })
    }));

    doc.getElementById('a').value = '10';
    doc.getElementById('b').value = '0';
    doc.getElementById('op').value = 'div';

    const form = doc.getElementById('calc-form');
    form.dispatchEvent(new win.Event('submit'));

    await new Promise(r => setTimeout(r));

    const errorEl = doc.getElementById('error');
    const resultCard = doc.getElementById('result');

    expect(resultCard.classList.contains('hidden')).toBeFalse();
    expect(errorEl.textContent).toContain('Divisão por zero');
  });

  it('botão "Limpar" deve resetar o formulário e esconder resultado', () => {
    const clearBtn = doc.getElementById('clear');
    clearBtn.click();

    const a = doc.getElementById('a').value;
    const b = doc.getElementById('b').value;
    const op = doc.getElementById('op').value;
    const resultCard = doc.getElementById('result');

    expect(a).toBe('');
    expect(b).toBe('');
    expect(op).toBe('add'); // valor padrão
    expect(resultCard.classList.contains('hidden')).toBeTrue();
  });
});
