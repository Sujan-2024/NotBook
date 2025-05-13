// DOM Elements
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const taskCount = document.getElementById('task-count');
const filterButtons = document.querySelectorAll('[data-filter]');
const exportButton = document.getElementById('export-excel');

// Todo array to store tasks
let todos = JSON.parse(localStorage.getItem('todos')) || [];

// Initialize the app
function init() {
    renderTodos();
    updateTaskCount();
}

// Save todos to localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Create a new todo item
function createTodoElement(todo) {
    const li = document.createElement('li');
    li.className = `list-group-item ${todo.completed ? 'completed' : ''}`;
    li.dataset.id = todo.id;

    const checkbox = document.createElement('div');
    checkbox.className = `todo-checkbox ${todo.completed ? 'checked' : ''}`;
    checkbox.innerHTML = todo.completed ? '<i class="fas fa-check text-white"></i>' : '';
    checkbox.addEventListener('click', () => toggleTodo(todo.id));

    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.text;

    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-edit me-2';
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.addEventListener('click', () => enableEditMode(todo.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-delete';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(actions);

    return li;
}

// Render todos based on current filter
function renderTodos() {
    const filter = document.querySelector('[data-filter].active').dataset.filter;
    todoList.innerHTML = '';

    const filteredTodos = todos.filter(todo => {
        if (filter === 'active') return !todo.completed;
        if (filter === 'completed') return todo.completed;
        return true;
    });

    filteredTodos.forEach(todo => {
        todoList.appendChild(createTodoElement(todo));
    });
}

// Add new todo
function addTodo(text) {
    const todo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };

    todos.push(todo);
    saveTodos();
    renderTodos();
    updateTaskCount();
}

// Toggle todo completion status
function toggleTodo(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });

    saveTodos();
    renderTodos();
    updateTaskCount();
}

// Delete todo
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
    updateTaskCount();
}

// Update task count
function updateTaskCount() {
    const activeCount = todos.filter(todo => !todo.completed).length;
    taskCount.textContent = `${activeCount} task${activeCount !== 1 ? 's' : ''} remaining`;
}

// Export to Excel
function exportToExcel() {
    const data = todos.map(todo => ({
        'Task': todo.text,
        'Status': todo.completed ? 'Completed' : 'Active',
        'Created At': new Date(todo.createdAt).toLocaleString()
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Todos');
    XLSX.writeFile(wb, 'todo-list.xlsx');
}

// Enable edit mode for a todo item
function enableEditMode(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const li = document.querySelector(`[data-id="${id}"]`);
    const text = li.querySelector('.todo-text');
    const currentText = text.textContent;

    // Create edit input
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-control edit-input';
    input.value = currentText;

    // Create save and cancel buttons
    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn btn-success btn-sm ms-2';
    saveBtn.innerHTML = '<i class="fas fa-save"></i>';
    saveBtn.addEventListener('click', () => saveEdit(id, input.value));

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-secondary btn-sm ms-2';
    cancelBtn.innerHTML = '<i class="fas fa-times"></i>';
    cancelBtn.addEventListener('click', () => cancelEdit(id, currentText));

    // Replace text with input and buttons
    text.replaceWith(input);
    const actions = li.querySelector('.todo-actions');
    actions.innerHTML = '';
    actions.appendChild(saveBtn);
    actions.appendChild(cancelBtn);
    input.focus();
}

// Save edited todo
function saveEdit(id, newText) {
    if (!newText.trim()) return;

    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, text: newText.trim() };
        }
        return todo;
    });

    saveTodos();
    renderTodos();
}

// Cancel edit mode
function cancelEdit(id, originalText) {
    renderTodos();
}

// Event Listeners
todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (text) {
        addTodo(text);
        todoInput.value = '';
    }
});

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        renderTodos();
    });
});

exportButton.addEventListener('click', exportToExcel);

// Initialize the app
init(); 