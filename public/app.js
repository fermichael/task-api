// HTML cria os elementos, CSS define a aparência e este JavaScript conecta a página à API.
// Sem framework ou build: o navegador executa este arquivo diretamente.
const $ = (id) => document.getElementById(id);
let mode = 'login';
let tasks = [];
let filter = 'all';
let selectedTask = null;
let loadingTasks = false;

class ApiError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

// fetch envia um pedido HTTP, como o Postman. await espera a resposta antes de continuar.
async function request(path, method = 'GET', body) {
  let response;
  try {
    response = await fetch(path, {
      method,
      credentials: 'same-origin', // O navegador envia o cookie para a mesma API.
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Não foi possível conectar à API. Confira se o servidor está rodando.', 0);
  }
  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(data?.mensagem || 'Não foi possível concluir o pedido.', response.status);
  return data;
}

function message(id, text = '', error = false) {
  $(id).textContent = text; // textContent exibe texto, sem interpretar títulos como HTML.
  $(id).className = `message ${error ? 'error' : 'success'}`;
}

function showAuth(note = '') {
  $('auth-view').hidden = false;
  $('tasks-view').hidden = true;
  $('boot-message').hidden = true;
  tasks = [];
  message('auth-message', note, Boolean(note));
}

function setMode(next) {
  mode = next;
  const signup = mode === 'signup';
  $('name-field').hidden = !signup;
  $('name').required = signup;
  $('password').autocomplete = signup ? 'new-password' : 'current-password';
  $('password').value = '';
  $('auth-title').textContent = signup ? 'Seu próximo passo começa aqui.' : 'Bom ter você por aqui.';
  $('auth-description').textContent = signup ? 'Crie uma conta para organizar suas tarefas.' : 'Entre para acessar suas tarefas.';
  $('auth-submit').textContent = signup ? 'Criar minha conta ↗' : 'Entrar na minha conta ↗';
  for (const [id, active] of [['login-tab', !signup], ['signup-tab', signup]]) {
    $(id).classList.toggle('active', active);
    $(id).setAttribute('aria-pressed', String(active));
  }
  message('auth-message');
}

function handleError(error, target = 'tasks-message') {
  if (error.status === 401) {
    $('edit-dialog').close();
    $('delete-dialog').close();
    showAuth('Sua sessão terminou. Entre novamente para continuar.');
  } else message(target, error.message, true);
}

function render() {
  const done = tasks.filter((task) => task.concluida).length;
  $('total-count').textContent = tasks.length;
  $('pending-count').textContent = tasks.length - done;
  $('done-count').textContent = done;
  const visible = tasks.filter((task) => filter === 'all' || (filter === 'done' ? task.concluida : !task.concluida));
  $('task-list').replaceChildren();
  $('empty-state').hidden = visible.length !== 0 || loadingTasks;
  $('empty-title').textContent = tasks.length ? 'Tudo certo por aqui.' : 'Um bom começo.';
  $('empty-description').textContent = tasks.length ? 'Nenhuma tarefa neste filtro. Escolha outro para ver sua lista.' : 'Adicione sua primeira tarefa e dê o próximo passo.';
  $('list-summary').textContent = loadingTasks ? 'Carregando tarefas…' : `${visible.length} ${visible.length === 1 ? 'tarefa na lista' : 'tarefas na lista'}`;
  for (const task of visible) {
    const row = document.createElement('article');
    row.className = `task-row${task.concluida ? ' completed' : ''}`;
    const check = document.createElement('input');
    check.type = 'checkbox'; check.className = 'task-check'; check.checked = task.concluida;
    check.setAttribute('aria-label', `${task.concluida ? 'Marcar como pendente' : 'Concluir'}: ${task.tarefa}`);
    check.addEventListener('change', async () => {
      check.disabled = true;
      try {
        const updated = await request(`/tarefas/${task.id}/concluida`, 'PATCH', { concluida: check.checked });
        tasks = tasks.map((item) => item.id === task.id ? updated : item);
        render(); message('tasks-message', updated.concluida ? 'Mais um passo concluído!' : 'Tarefa marcada como pendente.');
      } catch (error) { check.checked = task.concluida; check.disabled = false; handleError(error); }
    });
    const content = document.createElement('div'); content.className = 'task-content';
    const title = document.createElement('p'); title.className = 'task-title'; title.textContent = task.tarefa;
    const meta = document.createElement('p'); meta.className = 'task-meta'; meta.textContent = task.concluida ? 'Concluída' : 'Um próximo passo';
    content.append(title, meta);
    const actions = document.createElement('div'); actions.className = 'task-actions';
    const edit = document.createElement('button'); edit.type = 'button'; edit.textContent = 'Editar'; edit.setAttribute('aria-label', `Editar: ${task.tarefa}`);
    edit.addEventListener('click', () => { selectedTask = task; $('edit-title').value = task.tarefa; message('edit-message'); $('edit-dialog').showModal(); $('edit-title').focus(); });
    const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Excluir'; remove.setAttribute('aria-label', `Excluir: ${task.tarefa}`);
    remove.addEventListener('click', () => { selectedTask = task; $('delete-title').textContent = task.tarefa; message('delete-message'); $('delete-dialog').showModal(); });
    actions.append(edit, remove); row.append(check, content, actions); $('task-list').append(row);
  }
}

async function loadTasks() {
  loadingTasks = true; render(); $('refresh').disabled = true;
  try { tasks = await request('/tarefas'); }
  finally { loadingTasks = false; $('refresh').disabled = false; render(); }
}

async function showWorkspace() {
  $('auth-view').hidden = true; $('tasks-view').hidden = false; $('boot-message').hidden = true;
  message('tasks-message');
  try { await loadTasks(); } catch (error) { handleError(error); }
}

$('login-tab').addEventListener('click', () => setMode('login'));
$('signup-tab').addEventListener('click', () => setMode('signup'));
$('auth-form').addEventListener('submit', async (event) => {
  event.preventDefault(); $('auth-submit').disabled = true; message('auth-message');
  try {
    const email = $('email').value.trim(); const senha = $('password').value;
    if (mode === 'signup') {
      const nome = $('name').value.trim();
      if (!nome) throw new Error('Informe seu nome.');
      await request('/users', 'POST', { nome, email, senha });
      setMode('login'); message('auth-message', 'Conta criada! Agora entre com seu email e sua senha.');
      $('password').focus();
    } else {
      await request('/users/login', 'POST', { email, senha });
      $('password').value = ''; await showWorkspace();
    }
  } catch (error) { message('auth-message', error.message, true); }
  finally { $('auth-submit').disabled = false; }
});

$('new-task-form').addEventListener('submit', async (event) => {
  event.preventDefault(); const titulo = $('new-task').value.trim();
  if (!titulo) { message('tasks-message', 'Escreva um título antes de adicionar.', true); return; }
  $('add-task').disabled = true;
  try {
    const task = await request('/tarefas', 'POST', { titulo });
    tasks.push(task); $('new-task').value = ''; render(); message('tasks-message', 'Tarefa adicionada. Um passo de cada vez.');
  } catch (error) { handleError(error); }
  finally { $('add-task').disabled = false; }
});

document.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => {
  filter = button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach((item) => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); });
  render();
}));
$('refresh').addEventListener('click', async () => { message('tasks-message'); try { await loadTasks(); } catch (error) { handleError(error); } });
$('logout').addEventListener('click', async () => {
  $('logout').disabled = true;
  try { await request('/users/logout', 'POST'); showAuth(); setMode('login'); }
  catch (error) { handleError(error); }
  finally { $('logout').disabled = false; }
});

$('cancel-edit').addEventListener('click', () => $('edit-dialog').close());
$('cancel-delete').addEventListener('click', () => $('delete-dialog').close());
$('edit-form').addEventListener('submit', async (event) => {
  event.preventDefault(); const titulo = $('edit-title').value.trim();
  if (!titulo) { message('edit-message', 'O título não pode ficar vazio.', true); return; }
  const button = event.target.querySelector('[type="submit"]'); button.disabled = true;
  try {
    const task = await request(`/tarefas/${selectedTask.id}`, 'PATCH', { titulo });
    tasks = tasks.map((item) => item.id === task.id ? task : item); render(); $('edit-dialog').close(); message('tasks-message', 'Tarefa atualizada.');
  } catch (error) { handleError(error, 'edit-message'); }
  finally { button.disabled = false; }
});
$('delete-form').addEventListener('submit', async (event) => {
  event.preventDefault(); const button = event.target.querySelector('[type="submit"]'); button.disabled = true;
  try {
    const id = selectedTask.id; await request(`/tarefas/${id}`, 'DELETE');
    tasks = tasks.filter((item) => item.id !== id); render(); $('delete-dialog').close(); message('tasks-message', 'Tarefa excluída.');
  } catch (error) { handleError(error, 'delete-message'); }
  finally { button.disabled = false; }
});

// Ao abrir a página, verifica se o navegador ainda tem uma sessão válida.
(async () => {
  try { await request('/users/me'); await showWorkspace(); }
  catch (error) { showAuth(error.status === 401 ? '' : error.message); }
})();
