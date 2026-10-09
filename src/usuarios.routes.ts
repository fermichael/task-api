import * as argon2 from 'argon2';
import { Router } from 'express';

import { pool } from './database';

export const usuariosRouter = Router();

usuariosRouter.post('/users', async (req, res) => {
  const nome = req.body?.nome;
  const email = req.body?.email;
  const senha = req.body?.senha;

  if (
    typeof nome !== 'string' ||
    typeof email !== 'string' ||
    typeof senha !== 'string' ||
    nome.trim() === '' ||
    email.trim() === '' ||
    senha === ''
  ) {
    res.status(400).json({
      mensagem: 'Envie em texto, não vazio.',
    });
    return;
  }

  try {
    const senhaHash = await argon2.hash(senha);
    const resultado = await pool.query(
      `INSERT INTO usuarios (nome, email, senha_hash)
             VALUES ($1, $2, $3)
             ON CONFLICT (email) DO NOTHING
             RETURNING id, nome, email`,
      [nome.trim(), email.trim(), senhaHash]
    );

    if (resultado.rows.length === 0) {
      res.status(409).json({
        mensagem: 'Email já cadastrado',
      });
      return;
    }

    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: 'Não foi possível cadastrar o usuário.',
    });
  }
});

usuariosRouter.post('/users/login', async (req, res) => {
  const email = req.body?.email;
  const senha = req.body?.senha;

  if (
    typeof email !== 'string' ||
    email.trim() === '' ||
    typeof senha !== 'string' ||
    senha === ''
  ) {
    res.status(400).json({
      mensagem: 'Por favor, insira um texto válido',
    });
    return;
  }

  try {
    const resultado = await pool.query(
      `
        SELECT id, nome, email, senha_hash FROM usuarios WHERE email = $1`,
      [email.trim()]
    );

    if (resultado.rows.length === 0) {
      res.status(401).json({
        mensagem: 'Email ou senha inválidos.',
      });
      return;
    }

    const user = resultado.rows[0];

    const senhaCorreta = await argon2.verify(user.senha_hash, senha);

    if (senhaCorreta === false) {
      res.status(401).json({ mensagem: 'Email ou senha inválidos.' });
      return;
    }

    req.session.regenerate((erro) => {
      if (erro) {
        console.error(erro);

        res.status(500).json({
          mensagem: 'Não foi possível iniciar a sessão',
        });
        return;
      }
      req.session.usuarioId = user.id;
      res.status(200).json({
        mensagem: 'Credenciais verificada',
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensagem: 'Não foi possível processar o login',
    });
  }
});

usuariosRouter.post('/users/logout', (req, res) => {
  req.session.destroy((erro) => {
    if (erro) {
      console.error(erro);

      res.status(500).json({
        mensagem: 'Não foi possível encerrar a sessão',
      });
      return;
    }

    res.clearCookie('connect.sid');
    res.status(204).send();
  });
});

usuariosRouter.get('/users/me', async (req, res) => {
  const user = req.session.usuarioId;

  if (user === undefined) {
    res.status(401).json({
      mensagem: 'Faça login para continuar',
    });
    return;
  }

  res.status(200).json({ id: user });
});
