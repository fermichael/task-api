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

## Interface web

Com o PostgreSQL configurado e em execução, inicie a API com `npm run dev`
e abra **http://localhost:3000** no navegador. Se a loja de RPG estiver usando
essa porta, encerre aquele servidor primeiro.

A interface permite cadastrar uma conta, entrar, criar, editar, concluir e
excluir tarefas, filtrar a lista e sair da conta. Use o endereço HTTP;
não abra o HTML diretamente nem use Live Server.

### Como o frontend funciona

- `public/index.html`: estrutura da página, formulários e botões.
- `public/styles.css`: cores, layout e adaptação para telas pequenas.
- `public/app.js`: eventos e pedidos HTTP com `fetch`, usando as rotas existentes.
- `src/server.ts`: `express.static` entrega os três arquivos ao navegador.

O frontend e a API usam a mesma origem. O navegador guarda o cookie de sessão
e o envia nos pedidos; o JavaScript não precisa ler o cookie nem guardar senhas.
`await fetch(...)` espera a resposta, e `response.json()` lê seu corpo.
O filtro Todas/Pendentes/Concluídas usa a lista já recebida, sem mudar as rotas.

Cadastro e login continuam sendo operações separadas. Reiniciar a API apaga
as sessões em memória, mas preserva usuários e tarefas no PostgreSQL.
