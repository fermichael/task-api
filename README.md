# ApiCodex — API de tarefas

API desenvolvida com Node.js, TypeScript, Express e PostgreSQL.

Permite cadastrar usuários, fazer login e logout, além de criar, consultar, editar, concluir e excluir tarefas. Cada usuário só pode acessar suas próprias tarefas.

As senhas são armazenadas como hashes Argon2. A autenticação utiliza sessões identificadas por cookies.

## Evolução do projeto

Este projeto é uma evolução do [nodejs-learning-project](https://github.com/fermichael/nodejs-learning-project), meu projeto inicial de estudos com Node.js.

No projeto anterior, pratiquei:

- Node.js com o módulo HTTP nativo;
- requisições e respostas HTTP;
- headers e CORS;
- respostas JSON;
- uma API mock com dados fixos.

Neste projeto avancei para:

- TypeScript;
- Express;
- PostgreSQL;
- cadastro e autenticação de usuários;
- sessões;
- hash de senhas com Argon2;
- CRUD de tarefas;
- autorização por usuário.

## Rotas

### Usuários

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/users` | Cadastra um usuário |
| `POST` | `/users/login` | Inicia uma sessão |
| `POST` | `/users/logout` | Encerra a sessão |
| `GET` | `/users/me` | Consulta o usuário autenticado |

### Tarefas

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/tarefas` | Lista as tarefas do usuário |
| `GET` | `/tarefas/:id` | Consulta uma tarefa |
| `POST` | `/tarefas` | Cria uma tarefa |
| `PATCH` | `/tarefas/:id` | Altera o título |
| `PATCH` | `/tarefas/:id/concluida` | Altera o status de conclusão |
| `DELETE` | `/tarefas/:id` | Exclui uma tarefa |

## Como executar

### Requisitos

- Node.js e npm.
- PostgreSQL em execução.
- Um cliente como Postman ou Insomnia para testar as rotas.

### 1. Instalar as dependências

Na pasta do projeto:

```bash
npm install
```

### 2. Preparar o banco

Crie um banco chamado `api_tarefas`. Conecte-se a ele e execute os comandos abaixo caso as tabelas ainda não existam:

```sql
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL
);

CREATE TABLE tarefas (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tarefa TEXT NOT NULL,
  concluida BOOLEAN NOT NULL DEFAULT false,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE
);
```

### 3. Configurar as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```dotenv
PGHOST=localhost
PGPORT=5432
PGDATABASE=api_tarefas
PGUSER=postgres
PGPASSWORD=substitua_pela_senha_do_banco
SESSION_SECRET=substitua_por_uma_chave_aleatoria
```

Para gerar a chave da sessão:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Copie o resultado para `SESSION_SECRET`. Mantenha `.env` no `.gitignore` e não publique suas credenciais.

### 4. Iniciar a API

```bash
npm run dev
```

A API estará disponível em:

```text
http://localhost:3000
```

O modo de desenvolvimento reinicia a API quando os arquivos são alterados.

### 5. Verificar os tipos

```bash
npm run typecheck
```
