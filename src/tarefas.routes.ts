import { Router } from 'express';

import { pool } from './database';

export const tarefasRouter = Router();

tarefasRouter.get('/tarefas', async (req, res) => {
  const user = req.session.usuarioId;

  if (user === undefined) {
    res.status(401).json({
      mensagem: 'Faça login para continuar',
    });
    return;
  }

  try {
    const resultado = await pool.query(
      `SELECT id, tarefa, concluida
      FROM tarefas
      WHERE usuario_id = $1
      ORDER BY id`,
      [user]
    );

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: 'Não foi possível consultar as tarefas',
    });
  }
});

tarefasRouter.get('/tarefas/:id', async (req, res) => {
  const id = Number(req.params.id);
  const user = req.session.usuarioId;

  if (user === undefined) {
    res.status(401).json({
      mensagem: 'Faça login para continuar',
    });
    return;
  }

  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({
      mensagem: 'O ID deve ser um número inteiro positivo',
    });
    return;
  }

  try {
    const resultado = await pool.query(
      'SELECT id, tarefa, concluida FROM tarefas WHERE id = $1 AND usuario_id = $2',
      [id, user]
    );

    if (resultado.rows.length === 0) {
      res.status(404).json({
        mensagem: 'Tarefa não encontrada',
      });
      return;
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: 'Não foi possível consultar a tarefa',
    });
  }
});

tarefasRouter.post('/tarefas', async (req, res) => {
  const titulo = req.body?.titulo;
  const user = req.session.usuarioId;

  if (user === undefined) {
    res.status(401).json({
      mensagem: 'Faça login para continuar',
    });
    return;
  }

  if (typeof titulo !== 'string' || titulo.trim() === '') {
    res.status(400).json({
      mensagem: 'Envie um título em texto, não vazio',
    });
    return;
  }

  try {
    const resultado = await pool.query(
      'INSERT INTO tarefas (tarefa, usuario_id) VALUES ($1, $2) RETURNING id, tarefa, usuario_id, concluida',
      [titulo.trim(), user]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({
      mensagem: 'Não foi possível criar a tarefa',
    });
  }
});

tarefasRouter.delete('/tarefas/:id', async (req, res) => {
  const id = Number(req.params.id);
  const user = req.session.usuarioId;

  if (user === undefined) {
    res.status(401).json({
      mensagem: 'Faça login para continuar',
    });
    return;
  }

  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({
      mensagem: 'O ID deve ser um número inteiro positivo',
    });
    return;
  }

  try {
    const resultado = await pool.query(
      'DELETE FROM tarefas WHERE id = $1 AND usuario_id = $2 RETURNING id',
      [id, user]
    );

    if (resultado.rows.length === 0) {
      res.status(404).json({
        mensagem: 'Tarefa não encontrada',
      });
      return;
    }

    res.status(204).send();
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: 'Não foi possível excluir a tarefa',
    });
  }
});

tarefasRouter.patch('/tarefas/:id', async (req, res) => {
  const id = Number(req.params.id);
  const titulo = req.body?.titulo;
  const user = req.session.usuarioId;

  if (user === undefined) {
    res.status(401).json({
      mensagem: 'Faça login para continuar',
    });
    return;
  }

  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({
      mensagem: 'O ID deve ser um número inteiro positivo',
    });
    return;
  }

  if (typeof titulo !== 'string' || titulo.trim() === '') {
    res.status(400).json({
      mensagem: 'Envie um título em texto, não vazio',
    });
    return;
  }

  try {
    const resultado = await pool.query(
      'UPDATE tarefas SET tarefa = $1 WHERE id = $2 AND usuario_id = $3 RETURNING id, tarefa, concluida',
      [titulo.trim(), id, user]
    );

    if (resultado.rows.length === 0) {
      res.status(404).json({
        mensagem: 'Tarefa não encontrada',
      });
      return;
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: 'Não foi possível atualizar a tarefa',
    });
  }
});

tarefasRouter.patch('/tarefas/:id/concluida', async (req, res) => {
  const id = Number(req.params.id);
  const concluida = req.body?.concluida;
  const user = req.session.usuarioId;

  if (user === undefined) {
    res.status(401).json({
      mensagem: 'Faça login para continuar',
    });
    return;
  }

  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({
      mensagem: 'O ID deve ser um número inteiro positivo',
    });
    return;
  }

  if (typeof concluida !== 'boolean') {
    res.status(400).json({
      mensagem: 'Envie concluída como true ou false',
    });
    return;
  }

  try {
    const resultado = await pool.query(
      `UPDATE tarefas
      SET concluida = $1
      WHERE id = $2 AND usuario_id = $3
      RETURNING id, tarefa, concluida`,
      [concluida, id, user]
    );

    if (resultado.rows.length === 0) {
      res.status(404).json({
        mensagem: 'Tarefa não encontrada',
      });
      return;
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: 'Não foi possível atualizar a conclusão',
    });
  }
});
