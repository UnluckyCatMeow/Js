const list = document.getElementById('todo-list');
const itemCountSpan = document.getElementById('item-count');
const uncheckedCountSpan = document.getElementById('unchecked-count');
const statusMessage = document.getElementById('status-message');

let todos = [];


const BASE_URL = 'https://todo-app-2-33cc1-default-rtdb.firebaseio.com/todos.json';

document.addEventListener('DOMContentLoaded', function () {
  getTodos();
});

function showStatus(message, type = 'info') {
  statusMessage.textContent = message;
  statusMessage.className = `alert alert-${type}`;
}

function hideStatus() {
  statusMessage.textContent = '';
  statusMessage.className = 'alert alert-info d-none';
}

async function getTodos() {
  try {
    showStatus('Завантаження справ з бази даних...', 'info');

    const response = await fetch(BASE_URL);
    const data = await response.json();

    if (data) {
      todos = Object.keys(data).map(function (key) {
        return {
          id: key,
          text: data[key].text,
          checked: data[key].checked
        };
      });
    } else {
      todos = [];
    }

    render(todos);
    updateCounter();
    hideStatus();
  } catch (error) {
    console.error('Помилка читання з БД:', error);
    showStatus('Помилка завантаження даних з бази', 'danger');
  }
}

async function addTodo(todo) {
  try {
    showStatus('Додавання справи до бази даних...', 'info');

    const options = {
      method: 'POST',
      body: JSON.stringify({
        text: todo.text,
        checked: todo.checked
      }),
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      }
    };

    const response = await fetch(BASE_URL, options);
    const data = await response.json();

    console.log('Відповідь Firebase після POST:', data);

    todo.id = data.name;
    todos.push(todo);

    render(todos);
    updateCounter();
    hideStatus();
  } catch (error) {
    console.error('Помилка додавання в БД:', error);
    showStatus('Помилка додавання справи', 'danger');
  }
}

function newTodo() {
  const todoText = prompt('Введіть нову справу:');

  if (todoText === null || todoText.trim() === '') {
    return;
  }

  const newItem = {
    text: todoText.trim(),
    checked: false
  };

  addTodo(newItem);
}

function renderTodo(todo) {
  const checkedAttribute = todo.checked ? 'checked' : '';
  const textClass = todo.checked ? 'text-success text-decoration-line-through' : '';

  return `
    <li class="list-group-item">
      <input 
        type="checkbox" 
        class="form-check-input me-2" 
        id="${todo.id}" 
        ${checkedAttribute}
        onchange="checkTodo('${todo.id}')"
      />

      <label for="${todo.id}">
        <span class="${textClass}">${todo.text}</span>
      </label>

      <button 
        class="btn btn-danger btn-sm float-end" 
        onclick="deleteTodo('${todo.id}')">
        delete
      </button>
    </li>
  `;
}

function render(todosArray) {
  if (todosArray.length === 0) {
    list.innerHTML = '<li class="list-group-item text-muted">Список справ порожній</li>';
    return;
  }

  const markup = todosArray.map(function (todo) {
    return renderTodo(todo);
  }).join('');

  list.innerHTML = markup;
}

function updateCounter() {
  itemCountSpan.textContent = todos.length;

  const uncheckedCount = todos.filter(function (todo) {
    return todo.checked === false;
  }).length;

  uncheckedCountSpan.textContent = uncheckedCount;
}

async function deleteTodo(id) {
  try {
    showStatus('Видалення справи з бази даних...', 'info');

    const deleteUrl = BASE_URL.replace('.json', `/${id}.json`);

    await fetch(deleteUrl, {
      method: 'DELETE'
    });

    todos = todos.filter(function (todo) {
      return todo.id !== id;
    });

    render(todos);
    updateCounter();
    hideStatus();
  } catch (error) {
    console.error('Помилка видалення з БД:', error);
    showStatus('Помилка видалення справи', 'danger');
  }
}

async function checkTodo(id) {
  const todo = todos.find(function (item) {
    return item.id === id;
  });

  if (!todo) {
    return;
  }

  const updatedTodo = {
    checked: !todo.checked
  };

  try {
    showStatus('Оновлення справи в базі даних...', 'info');

    const updateUrl = BASE_URL.replace('.json', `/${id}.json`);

    const options = {
      method: 'PATCH',
      body: JSON.stringify(updatedTodo),
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      }
    };

    await fetch(updateUrl, options);

    todos = todos.map(function (item) {
      if (item.id === id) {
        return {
          id: item.id,
          text: item.text,
          checked: !item.checked
        };
      }

      return item;
    });

    render(todos);
    updateCounter();
    hideStatus();
  } catch (error) {
    console.error('Помилка оновлення в БД:', error);
    showStatus('Помилка оновлення справи', 'danger');
  }
}