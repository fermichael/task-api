// Cada função corresponde a uma ação da página e a uma rota da API.
// As telas são seções do HTML. A edição acontece na linha da tarefa, sem janela personalizada.

// document representa a página. getElementById encontra um elemento pelo id do HTML.
const mensagem = document.getElementById('mensagem');
const lista = document.getElementById('lista-tarefas');
const avisoLista = document.getElementById('aviso-lista');

// Registrar um evento não executa a função agora: ela roda quando a pessoa interage.
document.getElementById('form-login').addEventListener('submit', entrar);
document.getElementById('form-cadastro').addEventListener('submit', cadastrar);
document.getElementById('form-tarefa').addEventListener('submit', adicionarTarefa);
document.getElementById('botao-listar').addEventListener('click', listarTarefas);
document.getElementById('botao-sair').addEventListener('click', sair);
document.getElementById('abrir-cadastro').addEventListener('click', () => {
  mostrarTela('tela-cadastro');
  mensagem.textContent = '';
  document.getElementById('login-senha').value = '';
});
document.getElementById('abrir-login').addEventListener('click', () => {
  mostrarTela('tela-login');
  mensagem.textContent = '';
  document.getElementById('cadastro-senha').value = '';
});

// Apenas esta função cuida da troca de telas. Não há navegação ou framework escondido.
function mostrarTela(nome) {
  document.getElementById('tela-login').hidden = nome !== 'tela-login';
  document.getElementById('tela-cadastro').hidden = nome !== 'tela-cadastro';
  document.getElementById('tela-tarefas').hidden = nome !== 'tela-tarefas';
  document.getElementById('carregando').hidden = true;
}


async function entrar(evento) {
  evento.preventDefault(); // Impede o formulário de recarregar a página.
  const botao = evento.submitter;
  botao.disabled = true; // Evita enviar o mesmo formulário duas vezes enquanto espera.
  try {
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;
    // fetch faz o pedido HTTP. A URL relativa usa o endereço da própria página.
    const resposta = await fetch('/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }), // Transforma o objeto em texto JSON.
      credentials: 'same-origin', // Permite enviar o cookie para a mesma origem.
    });
    const dados = await resposta.json(); // Lê o JSON retornado pela API.
    if (!resposta.ok) {
      mensagem.textContent = dados.mensagem;
      if (resposta.status === 401) mostrarTela('tela-login');
      return;
    }
    document.getElementById('login-senha').value = '';
    mostrarTela('tela-tarefas');
    mensagem.textContent = 'Login realizado.';
    await listarTarefas();
  } catch {
    mensagem.textContent = 'Não foi possível conectar. Confira se a API está rodando.';
  } finally {
    botao.disabled = false; // Executa tanto no sucesso quanto na falha.
  }
}

async function cadastrar(evento) {
  evento.preventDefault();
  const botao = evento.submitter;
  botao.disabled = true;
  try {
    const nome = document.getElementById('cadastro-nome').value;
    const email = document.getElementById('cadastro-email').value;
    const senha = document.getElementById('cadastro-senha').value;
    const resposta = await fetch('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha }),
    });
    const dados = await resposta.json();
    if (!resposta.ok) {
      mensagem.textContent = dados.mensagem;
      if (resposta.status === 401) mostrarTela('tela-login');
      return;
    }
    document.getElementById('form-cadastro').reset();
    document.getElementById('login-email').value = dados.email;
    mostrarTela('tela-login');
    mensagem.textContent = 'Conta criada. Entre com seu email e sua senha.';
  } catch {
    mensagem.textContent = 'Não foi possível conectar. Confira se a API está rodando.';
  } finally {
    botao.disabled = false;
  }
}

async function listarTarefas() {
  const botao = document.getElementById('botao-listar');
  botao.disabled = true;
  try {
    const resposta = await fetch('/tarefas'); // Sem method: fetch usa GET.
    const dados = await resposta.json();
    if (!resposta.ok) {
      mensagem.textContent = dados.mensagem;
      if (resposta.status === 401) {
        lista.replaceChildren();
        avisoLista.textContent = '';
        mostrarTela('tela-login');
      }
      return;
    }
    lista.replaceChildren(); // Remove os elementos anteriores, evitando duplicar a lista.
    avisoLista.textContent = dados.length === 0 ? 'Você ainda não tem tarefas.' : 'Marque uma tarefa para concluí-la.';
    // dados é o array retornado por res.json(resultado.rows) na API.
    for (const tarefa of dados) {
      const item = document.createElement('li');
      const rotulo = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = tarefa.concluida;
      checkbox.addEventListener('change', async () => {
        checkbox.disabled = true;
        const atualizado = await concluirTarefa(tarefa.id, checkbox.checked);
        if (!atualizado) checkbox.checked = tarefa.concluida;
        checkbox.disabled = false;
      });
      const texto = document.createElement('span');
      texto.textContent = tarefa.tarefa; // Exibe texto sem interpretar como HTML.
      if (tarefa.concluida) texto.className = 'concluida';
      const excluir = document.createElement('button');
      excluir.type = 'button';
      excluir.textContent = 'Excluir';
      excluir.setAttribute('aria-label', 'Excluir: ' + tarefa.tarefa);
      excluir.addEventListener('click', async () => {
        excluir.disabled = true;
        await excluirTarefa(tarefa.id);
        excluir.disabled = false;
      });
      rotulo.append(checkbox, texto); // Coloca a caixa e o título dentro do label.
      
      const editar = document.createElement('button');
      editar.type = 'button';
      editar.textContent = 'Editar';
      editar.setAttribute('aria-label', 'Editar: ' + tarefa.tarefa);
      const acoes = document.createElement('div');
      acoes.className = 'acoes-tarefa';
      acoes.append(editar, excluir);
      editar.addEventListener('click', () => {
        // Esconde o título e os botões enquanto exibe o formulário de edição.
        rotulo.hidden = true;
        acoes.hidden = true;
        const formulario = document.createElement('form');
        formulario.className = 'form-edicao';
        const etiqueta = document.createElement('label');
        const campo = document.createElement('input');
        campo.id = 'editar-' + tarefa.id;
        campo.value = tarefa.tarefa;
        campo.required = true;
        etiqueta.htmlFor = campo.id;
        etiqueta.textContent = 'Novo título';
        const salvar = document.createElement('button');
        salvar.type = 'submit';
        salvar.textContent = 'Salvar';
        const cancelar = document.createElement('button');
        cancelar.type = 'button';
        cancelar.textContent = 'Cancelar';
        cancelar.addEventListener('click', () => {
          formulario.remove();
          rotulo.hidden = false;
          acoes.hidden = false;
          editar.focus();
        });
        formulario.addEventListener('submit', async (evento) => {
          evento.preventDefault();
          salvar.disabled = true;
          cancelar.disabled = true;
          await editarTarefa(tarefa.id, campo.value);
          salvar.disabled = false;
          cancelar.disabled = false;
        });
        formulario.append(etiqueta, campo, salvar, cancelar);
        item.append(formulario);
        campo.focus();
      });
      item.append(rotulo, acoes);
      lista.append(item); // Coloca a tarefa na lista visível.
    }
  } catch {
    mensagem.textContent = 'Não foi possível carregar a lista. Confira a conexão com a API.';
  } finally {
    botao.disabled = false;
  }
}

async function adicionarTarefa(evento) {
  evento.preventDefault();
  const botao = evento.submitter;
  botao.disabled = true;
  try {
    const titulo = document.getElementById('titulo').value;
    const resposta = await fetch('/tarefas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo }),
    });
    const dados = await resposta.json();
    if (!resposta.ok) {
      mensagem.textContent = dados.mensagem;
      if (resposta.status === 401) mostrarTela('tela-login');
      return;
    }
    document.getElementById('titulo').value = '';
    mensagem.textContent = 'Tarefa adicionada.';
    await listarTarefas(); // Consulta novamente: o banco é a fonte dos dados.
  } catch {
    mensagem.textContent = 'Não foi possível adicionar a tarefa. Confira a conexão.';
  } finally {
    botao.disabled = false;
  }
}

async function concluirTarefa(id, concluida) {
  try {
    const resposta = await fetch('/tarefas/' + id + '/concluida', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ concluida }),
    });
    const dados = await resposta.json();
    if (!resposta.ok) {
      mensagem.textContent = dados.mensagem;
      return false;
    }
    mensagem.textContent = concluida ? 'Tarefa concluída.' : 'Tarefa marcada como pendente.';
    await listarTarefas();
    return true;
  } catch {
    mensagem.textContent = 'Não foi possível alterar a conclusão. Confira a conexão.';
    return false;
  }
}

async function excluirTarefa(id) {
  if (!window.confirm('Excluir esta tarefa?')) return; // Confirmação nativa do navegador.
  try {
    const resposta = await fetch('/tarefas/' + id, { method: 'DELETE' });
    if (!resposta.ok) {
      const dados = await resposta.json();
      mensagem.textContent = dados.mensagem;
      if (resposta.status === 401) mostrarTela('tela-login');
      return;
    }
    // 204 não tem corpo: não chamamos resposta.json() no sucesso.
    mensagem.textContent = 'Tarefa excluída.';
    await listarTarefas();
  } catch {
    mensagem.textContent = 'Não foi possível excluir a tarefa. Confira a conexão.';
  }
}

async function sair() {
  const botao = document.getElementById('botao-sair');
  botao.disabled = true;
  try {
    const resposta = await fetch('/users/logout', { method: 'POST' });
    if (!resposta.ok) {
      const dados = await resposta.json();
      mensagem.textContent = dados.mensagem;
      if (resposta.status === 401) mostrarTela('tela-login');
      return;
    }
    lista.replaceChildren();
    avisoLista.textContent = 'Entre na conta e carregue suas tarefas.';
    mostrarTela('tela-login');
    document.getElementById('login-senha').value = '';
    mensagem.textContent = 'Você saiu da conta.';
  } catch {
    mensagem.textContent = 'Não foi possível sair. Confira a conexão com a API.';
  } finally {
    botao.disabled = false;
  }
}


// Mesmo padrão de criação: ler o novo título, enviar JSON e carregar a lista novamente.
async function editarTarefa(id, titulo) {
  try {
    const resposta = await fetch('/tarefas/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo }),
    });
    const dados = await resposta.json();
    if (!resposta.ok) {
      mensagem.textContent = dados.mensagem;
      if (resposta.status === 401) mostrarTela('tela-login');
      return;
    }
    mensagem.textContent = 'Tarefa editada.';
    await listarTarefas();
  } catch {
    mensagem.textContent = 'Não foi possível editar a tarefa. Confira a conexão.';
  }
}

// O cookie pode continuar válido ao recarregar: /users/me permite verificar isso.
async function verificarSessao() {
  try {
    const resposta = await fetch('/users/me');
    if (resposta.ok) {
      mostrarTela('tela-tarefas');
      await listarTarefas();
    } else {
      mostrarTela('tela-login');
      if (resposta.status !== 401) mensagem.textContent = 'Não foi possível verificar a sessão. Tente entrar novamente.';
    }
  } catch {
    mostrarTela('tela-login');
    mensagem.textContent = 'Não foi possível conectar. Confira se a API está rodando.';
  }
}

verificarSessao();
