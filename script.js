const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const dateInput = document.getElementById('dateInput');
const tasksList = document.getElementById('tasksList');
const filterAll = document.getElementById('filterAll');
const filterPending = document.getElementById('filterPending');
const filterDone = document.getElementById('filterDone');
const themeToggle = document.getElementById('themeToggle');
const mainBody = document.getElementById('mainBody');
const totalTasksElement = document.getElementById('totalTasks');
const pendingTasksElement = document.getElementById('pendingTasks');
const completedTasksElement = document.getElementById('completedTasks');

let tasks = [];
let filter = 'all';
let nextId = 1;
let currentTheme = 'primary';
let isDarkMode = false;

function loadThemeFromStorage() {
    const savedTheme = localStorage.getItem('theme');
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedTheme) currentTheme = savedTheme;
    isDarkMode = savedDarkMode === 'dark';
    if (mainBody) {
        mainBody.className = '';
        if (isDarkMode) {
            mainBody.className = `dark-mode theme-${currentTheme}`;
        } else {
            mainBody.className = `theme-${currentTheme}`;
        }
    }
    document.querySelectorAll('.theme-color').forEach(color => color.classList.remove('active'));
    const activeTheme = document.querySelector(`[data-theme="${currentTheme}"]`);
    if (activeTheme) activeTheme.classList.add('active');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        const text = themeToggle.querySelector('span');
        if (isDarkMode) {
            mainBody.classList.add('dark-mode');
            if (icon) icon.classList.replace('bi-moon', 'bi-sun');
            if (text) text.textContent = 'Claro';
            themeToggle.title = 'Alternar para modo claro';
        } else {
            mainBody.classList.remove('dark-mode');
            if (icon) icon.classList.replace('bi-sun', 'bi-moon');
            if (text) text.textContent = 'Escuro';
            themeToggle.title = 'Alternar para modo escuro';
        }
    }
}

function loadTasksFromStorage() {
    const stored = localStorage.getItem('tasks');
    if (stored) {
        tasks = JSON.parse(stored);
        if (tasks.length > 0) {
            nextId = Math.max(...tasks.map(t => t.id)) + 1;
        }
    } else {
        tasks = [
            { id: 1, text: 'Revisar conteúdo de História para a prova', date: '2025-08-15', completed: false },
            { id: 2, text: 'Fazer exercícios de Matemática', date: '2025-08-12', completed: true },
            { id: 3, text: 'Ler capítulo de Português sobre literatura', date: '2025-08-20', completed: false }
        ];
        nextId = 4;
        saveTasksToStorage();
    }
}

function saveTasksToStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

document.addEventListener('DOMContentLoaded', function() {
    loadThemeFromStorage();
    loadTasksFromStorage();
    setTodayDate();
    renderTasks();
    setupEventListeners();
});

function setupEventListeners() {
    document.querySelectorAll('.theme-color').forEach(color => {
        color.addEventListener('click', function() {
            changeColorTheme(this.dataset.theme);
        });
    });
    themeToggle.addEventListener('click', toggleDarkMode);
    filterAll.addEventListener('click', () => setFilter('all'));
    filterPending.addEventListener('click', () => setFilter('pending'));
    filterDone.addEventListener('click', () => setFilter('done'));
    taskForm.addEventListener('submit', addTask);
}

function changeColorTheme(theme) {
    mainBody.className = mainBody.className.replace(/theme-\w+/, '');
    mainBody.className = isDarkMode ? `dark-mode theme-${theme}` : `theme-${theme}`;
    currentTheme = theme;
    localStorage.setItem('theme', theme);
    document.querySelectorAll('.theme-color').forEach(color => color.classList.remove('active'));
    document.querySelector(`[data-theme="${theme}"]`).classList.add('active');
    document.body.style.animation = 'fadeIn 0.3s ease-in-out';
    setTimeout(() => { document.body.style.animation = ''; }, 300);
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('darkMode', isDarkMode ? 'dark' : 'light');
    const icon = themeToggle.querySelector('i');
    const text = themeToggle.querySelector('span');
    if (isDarkMode) {
        mainBody.classList.add('dark-mode');
        icon.classList.replace('bi-moon', 'bi-sun');
        text.textContent = 'Claro';
        themeToggle.title = 'Alternar para modo claro';
    } else {
        mainBody.classList.remove('dark-mode');
        icon.classList.replace('bi-sun', 'bi-moon');
        text.textContent = 'Escuro';
        themeToggle.title = 'Alternar para modo escuro';
    }
    mainBody.className = mainBody.className.replace(/theme-\w+/, '');
    mainBody.className = isDarkMode ? `dark-mode theme-${currentTheme}` : `theme-${currentTheme}`;
    document.body.style.transform = 'scale(0.98)';
    setTimeout(() => { document.body.style.transform = 'scale(1)'; }, 150);
}

function updateStats() {
    const total = tasks.length;
    const pending = tasks.filter(t => !t.completed).length;
    const completed = tasks.filter(t => t.completed).length;
    animateNumber(totalTasksElement, total);
    animateNumber(pendingTasksElement, pending);
    animateNumber(completedTasksElement, completed);
}

function animateNumber(element, targetNumber) {
    const currentNumber = parseInt(element.textContent) || 0;
    const increment = targetNumber > currentNumber ? 1 : -1;
    const steps = Math.abs(targetNumber - currentNumber);
    if (steps === 0) return;
    let current = currentNumber;
    const timer = setInterval(() => {
        current += increment;
        element.textContent = current;
        if (current === targetNumber) {
            clearInterval(timer);
            element.style.animation = 'pulse 0.5s ease-in-out';
            setTimeout(() => { element.style.animation = ''; }, 500);
        }
    }, 50);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return date.toLocaleDateString('pt-BR', options);
}

function isOverdue(dateString, completed) {
    if (completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(dateString);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate < today;
}

function renderTasks() {
    tasksList.innerHTML = '';
    let filtered = tasks;
    if (filter === 'pending') {
        filtered = tasks.filter(t => !t.completed);
    } else if (filter === 'done') {
        filtered = tasks.filter(t => t.completed);
    }
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    if (filtered.length === 0) {
        const emptyStateText =
            filter === 'all' ? 'Nenhuma tarefa encontrada' :
            filter === 'pending' ? 'Nenhuma tarefa pendente' :
            'Nenhuma tarefa concluída';
        tasksList.innerHTML = `
            <div class="col-12">
                <div class="empty-state fade-in">
                    <i class="bi bi-clipboard-x display-1"></i>
                    <h5 class="mt-3">${emptyStateText}</h5>
                    <p class="text-muted">Adicione uma nova tarefa para começar.</p>
                </div>
            </div>
        `;
        updateStats();
        return;
    }
    filtered.forEach((task, index) => {
        const col = document.createElement('div');
        col.className = 'col-md-6';
        const overdue = isOverdue(task.date, task.completed);
        const taskStatusClass = task.completed ? 'task-done' : '';
        col.innerHTML = `
            <div class="card h-100 shadow-sm ${taskStatusClass} task-card fade-in" data-id="${task.id}" style="animation-delay: ${index * 0.1}s;">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <h5 class="card-title fw-bold mb-2">${task.text}</h5>
                            <p class="card-text text-muted small mb-0">
                                <i class="bi bi-calendar-event me-2"></i>Limite: ${formatDate(task.date)}
                                ${overdue ? '<span class="badge badge-overdue ms-2"><i class="bi bi-exclamation-triangle me-1"></i>Atrasada</span>' : ''}
                            </p>
                        </div>
                        <div class="d-flex align-items-center gap-2 ms-3">
                            <button class="btn btn-sm btn-outline-success ${task.completed ? 'disabled' : ''}" onclick="toggleTask(${task.id})" title="Concluir">
                                <i class="bi bi-check-lg"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="removeTask(${task.id})" title="Remover">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        tasksList.appendChild(col);
    });
    updateStats();
}

function addTask(e) {
    e.preventDefault();
    const text = taskInput.value.trim();
    const date = dateInput.value;
    if (!text || !date) return;
    const newTask = {
        id: nextId++,
        text,
        date,
        completed: false
    };
    tasks.push(newTask);
    saveTasksToStorage();
    taskForm.reset();
    setTodayDate();
    renderTasks();
    const submitButton = taskForm.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="bi bi-check-lg me-2"></i>Adicionada!';
    submitButton.classList.add('btn-success');
    setTimeout(() => {
        submitButton.innerHTML = originalText;
        submitButton.classList.remove('btn-success');
    }, 1500);
}

function setFilter(newFilter) {
    filter = newFilter;
    setActiveFilter(document.getElementById(
        `filter${newFilter.charAt(0).toUpperCase() + newFilter.slice(1).replace('done', 'Done').replace('all', 'All').replace('pending', 'Pending')}`
    ));
    renderTasks();
}

function setActiveFilter(activeButton) {
    document.querySelectorAll('.btn-outline-secondary').forEach(btn => btn.classList.remove('active'));
    activeButton.classList.add('active');
}

function setTodayDate() {
    dateInput.value = new Date().toISOString().split('T')[0];
}

window.toggleTask = function(id) {
    const task = tasks.find(t => t.id === id);
    if (!task || task.completed) return;
    task.completed = !task.completed;
    saveTasksToStorage();
    const taskCard = document.querySelector(`[data-id="${id}"]`);
    if (taskCard) {
        taskCard.style.transform = 'scale(1.05)';
        taskCard.style.background = 'linear-gradient(135deg, #198754, #20c997)';
        setTimeout(() => {
            taskCard.style.transform = '';
            taskCard.style.background = '';
            renderTasks();
        }, 300);
    } else {
        renderTasks();
    }
};

window.removeTask = function(id) {
    if (confirm('Tem certeza que deseja remover esta tarefa?')) {
        const taskCard = document.querySelector(`[data-id="${id}"]`);
        if (taskCard) {
            taskCard.style.animation = 'slideUp 0.3s ease-out reverse';
            setTimeout(() => {
                tasks = tasks.filter(task => task.id !== id);
                saveTasksToStorage();
                renderTasks();
            }, 300);
        } else {
            tasks = tasks.filter(task => task.id !== id);
            saveTasksToStorage();
            renderTasks();
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (!darkModeToggle) return;
    const icon = darkModeToggle.querySelector('i');
    const savedMode = localStorage.getItem('darkMode');
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme) currentTheme = savedTheme;
    if (savedMode === 'dark' || (!savedMode && systemPrefersDark)) {
        document.body.classList.add('dark-mode');
        if (icon) icon.classList.replace('bi-moon-stars', 'bi-sun');
    }
    darkModeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            if (icon) icon.classList.replace('bi-moon-stars', 'bi-sun');
            localStorage.setItem('darkMode', 'dark');
        } else {
            if (icon) icon.classList.replace('bi-sun', 'bi-moon-stars');
            localStorage.setItem('darkMode', 'light');
        }
    });
});

window.onload = () => {
    setTodayDate();
    renderTasks();
};