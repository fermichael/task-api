import express from 'express';
import session from 'express-session';

import { tarefasRouter } from './tarefas.routes';
import { usuariosRouter } from './usuarios.routes';

import 'dotenv/config'

const app = express();

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  throw new Error("Configure SESSION_SECRET no .env");
}

app.use(express.json());

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false
}));

app.use(tarefasRouter);

app.use(usuariosRouter)

console.log("Banco configurado:", process.env.PGDATABASE);

app.listen(3000, () => {
  console.log("Server funcionando");
});