# Task API

Projeto pessoal criado para praticar o desenvolvimento de uma API de tarefas
com Node.js.

## Sobre o projeto

Esta API permite cadastrar usuários, fazer login e logout e gerenciar tarefas.
Cada usuário pode acessar apenas as próprias tarefas.

O projeto é uma evolução do
[nodejs-learning-project](https://github.com/fermichael/nodejs-learning-project).
No projeto anterior, pratiquei os fundamentos do Node.js e do protocolo HTTP
com uma API mock. Aqui avancei para uma aplicação com persistência, autenticação
e regras de acesso.

## Conceitos praticados

- TypeScript;
- Express;
- PostgreSQL;
- conexão com banco de dados;
- cadastro de usuários;
- autenticação com sessões;
- hash de senhas com Argon2;
- autorização por usuário;
- operações CRUD;
- validação de dados;
- respostas e códigos de status HTTP;
- organização de rotas.

## Funcionalidades

- cadastro de usuários;
- login e logout;
- consulta do usuário autenticado;
- criação de tarefas;
- consulta de tarefas;
- edição de tarefas;
- conclusão de tarefas;
- exclusão de tarefas.

## Tecnologias

- Node.js;
- TypeScript;
- Express;
- PostgreSQL;
- Argon2;
- express-session.

## Objetivo

Este projeto faz parte da minha evolução nos estudos de desenvolvimento
backend, saindo de uma API mock com dados fixos para uma API com banco de
dados, usuários e autenticação.

## Interface web de estudo

Com o PostgreSQL configurado e em execução, inicie a API com `npm run dev`
e abra **http://localhost:3000**. Não use Live Server nem abra o HTML diretamente.

A interface tem três telas: login, cadastro e tarefas. Após cadastrar, volte
ao login. Após entrar, a mesma tela reúne criação, listagem, edição do título,
conclusão/desmarcação, exclusão com confirmação e logout.

### Estrutura do frontend

- `public/index.html`: três seções; o atributo `hidden` escolhe a tela visível.
- `public/styles.css`: aparência simples e adaptação para celular.
- `public/app.js`: uma função por operação da API, com pedidos `fetch` explícitos.
- `src/server.ts`: entrega os arquivos com `express.static`.

`mostrarTela` alterna as seções. `entrar` lê os inputs e envia POST `/users/login`.
`verificarSessao` consulta `/users/me` ao abrir a página e recupera o acesso
se o cookie ainda for válido. `listarTarefas` cria elementos da lista para
cada objeto recebido. A edição usa um formulário na própria linha, sem modal.

Frontend e API têm a mesma origem: o navegador envia o cookie automaticamente.
Senhas e cookies não são guardados manualmente pelo JavaScript. As sessões
ficam em memória e desaparecem quando a API reinicia; os dados do banco permanecem.

Esta interface foi construída com apoio de IA como material de estudo.
