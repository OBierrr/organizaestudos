# OrganizaEstudos

Organizador de tarefas acadêmicas em HTML, CSS e JavaScript. O protótipo permite cadastrar, editar, filtrar, concluir e excluir tarefas. Os dados ficam no armazenamento local do navegador.

## Integrantes

- João Vitor Cirelli
- Gabriel Andrade da Silva
- Bruno Eduardo de Souza

## Como usar

Baixe o código ou extraia o ZIP do protótipo. Abra `index.html` em um navegador. As tarefas iniciais são exemplos para experimentar o sistema.

## Atividade Final Parte 1

- [Proposta e planejamento dos testes em PDF](OrganizaEstudos-Parte1-Planejamento.pdf)
- [Versão editável em Word](OrganizaEstudos-Parte1-Planejamento.docx)
- [Protótipo funcional em ZIP](OrganizaEstudos-prototipo.zip)

O PDF reúne a proposta, o plano de testes, os 29 casos de teste e a matriz de rastreabilidade. O ZIP é o complemento de demonstração. O planejamento prevê a implementação e a execução dos casos na Parte 2.

## Atividade Final Parte 2

A suíte reduzida usa `node:test` para três casos unitários e um caso de integração. O Playwright conduz o cadastro na interface e lê o armazenamento do Chromium. Os casos são CT-001, CT-002, CT-003 e CT-005 da Parte 1.

### Rodar os testes

Com Node.js 24 ou superior, execute na raiz do repositório:

```sh
npm ci
npx playwright install chromium
npm test
```

Em Linux, use `npx playwright install --with-deps chromium` se faltarem bibliotecas do sistema. Para retestar somente CT-001:

```sh
node --test --test-name-pattern=CT-001 test/organizaestudos.test.cjs
```

### GitHub Actions

O [workflow](.github/workflows/testes.yml) executa `npm test` a cada push e pull request. As execuções ficam na [aba Actions](https://github.com/OBierrr/organizaestudos/actions/workflows/testes.yml).
