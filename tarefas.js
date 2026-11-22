'use strict';

const RegrasDeTarefas = (() => {
  function tamanho(texto) {
    return Array.from(texto).length;
  }

  function validarTitulo(valor) {
    const titulo = valor.trim();
    const comprimento = tamanho(titulo);
    if (comprimento === 0) {
      return { titulo, erro: 'Informe um título para a tarefa.' };
    }
    if (comprimento > 100) {
      return { titulo, erro: 'Use até 100 caracteres no título.' };
    }
    return { titulo, erro: null };
  }

  function validarDescricao(descricao) {
    const erro = tamanho(descricao) > 500
      ? 'Use até 500 caracteres na descrição.'
      : null;
    return { descricao, erro };
  }

  function filtrarTarefas(tarefas, filtro) {
    if (filtro === 'all') return [...tarefas];
    return tarefas.filter(tarefa => tarefa.done === (filtro === 'done'));
  }

  return { tamanho, validarTitulo, validarDescricao, filtrarTarefas };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = RegrasDeTarefas;
}
