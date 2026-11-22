const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { readFile } = require('node:fs/promises');
const path = require('node:path');
const { test } = require('node:test');
const { validarTitulo, validarDescricao, filtrarTarefas } = require('../tarefas.js');

test('CT-001 | título obrigatório, normalização e limite de 100 caracteres', () => {
  for (const tamanho of [1, 2, 99, 100]) {
    const titulo = 'A'.repeat(tamanho);
    assert.equal(validarTitulo(titulo).erro, null, `Título com ${tamanho} caracteres deve ser aceito`);
  }
  for (const invalido of ['', '   ', 'A'.repeat(101)]) {
    assert.ok(validarTitulo(invalido).erro, 'Título vazio ou acima do limite deve ser recusado');
  }
  assert.deepEqual(validarTitulo('  Revisar  '), { titulo: 'Revisar', erro: null });
});

test('CT-002 | descrição opcional, conteúdo preservado e limite de 500 caracteres', () => {
  for (const tamanho of [0, 1, 499, 500]) {
    const descricao = 'D'.repeat(tamanho);
    assert.deepEqual(validarDescricao(descricao), { descricao, erro: null });
  }
  assert.ok(validarDescricao('D'.repeat(501)).erro);
  const comEspacos = '  Linha 1\nLinha 2  ';
  assert.deepEqual(validarDescricao(comEspacos), { descricao: comEspacos, erro: null });
});

test('CT-003 | filtros por estado preservam a base original', () => {
  const base = [
    { id: 'A', title: 'Revisar requisitos', done: false },
    { id: 'B', title: 'Escrever casos', done: false },
    { id: 'C', title: 'Ler materiais', done: true },
  ];
  const original = structuredClone(base);
  const esperados = { all: ['A', 'B', 'C'], pending: ['A', 'B'], done: ['C'] };
  for (const [filtro, ids] of Object.entries(esperados)) {
    assert.deepEqual(filtrarTarefas(base, filtro).map(tarefa => tarefa.id), ids);
    assert.deepEqual(filtrarTarefas([], filtro), []);
  }
  assert.deepEqual(base, original);
});

const arquivos = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/tarefas.js': ['tarefas.js', 'text/javascript; charset=utf-8'],
};

test('CT-005 | formulário grava a tarefa no localStorage do navegador', { timeout: 30_000 }, async () => {
  const { chromium } = require('playwright');
  const servidor = createServer(async (req, res) => {
    const arquivo = arquivos[req.url];
    if (!arquivo) return res.writeHead(404).end();
    try {
      const conteudo = await readFile(path.join(__dirname, '..', arquivo[0]));
      res.writeHead(200, { 'Content-Type': arquivo[1] }).end(conteudo);
    } catch {
      res.writeHead(500).end();
    }
  });
  await new Promise((resolve, reject) => {
    servidor.once('error', reject);
    servidor.listen(0, '127.0.0.1', resolve);
  });
  let navegador;
  try {
    const executablePath = process.env.ORGANIZAESTUDOS_CHROME || undefined;
    navegador = await chromium.launch({ executablePath });
    const pagina = await navegador.newPage();
    const chave = 'organizaestudos-prototipo-v1';
    await pagina.route('https://fonts.googleapis.com/**', rota => rota.abort());
    await pagina.addInitScript(chave => {
      if (localStorage.getItem(chave) === null) localStorage.setItem(chave, '[]');
    }, chave);
    await pagina.goto(`http://127.0.0.1:${servidor.address().port}/`);
    const cartoes = pagina.locator('#tasks article');
    assert.equal(await cartoes.count(), 0);

    const title = 'Revisar requisitos';
    const description = 'Conferir o escopo';
    await pagina.getByRole('button', { name: 'Nova tarefa', exact: true }).click();
    await pagina.locator('#task-title').fill(title);
    await pagina.locator('#task-description').fill(description);
    await pagina.locator('#submit-task').click();

    assert.equal(await cartoes.count(), 1);
    const cartao = cartoes.first();
    const id = await cartao.getAttribute('data-task-id');
    assert.ok(id, 'A tarefa criada tem um ID');
    assert.equal(await cartao.locator('h3').textContent(), title);
    assert.equal(await cartao.locator('p').textContent(), description);
    assert.equal(await cartao.locator('.badge').textContent(), 'Pendente');
    const gravadas = await pagina.evaluate(chave => JSON.parse(localStorage.getItem(chave)), chave);
    assert.deepEqual(gravadas, [{ id, title, description, done: false }]);
  } finally {
    await navegador?.close();
    await new Promise(resolve => servidor.close(resolve));
  }
});
