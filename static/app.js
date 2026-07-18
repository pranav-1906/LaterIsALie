// --- 0. INDIVIDUAL MEMORY (USER ID) ---
let userId = localStorage.getItem('later_user_id');
if (!userId) {
    // Generate a random ID for the user if they don't have one
    userId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('later_user_id', userId);
}

// A helper wrapper for fetch to always include the User-Id header
async function apiFetch(endpoint, options = {}) {
    const headers = {
        'User-Id': userId,
        ...options.headers
    };
    return fetch(endpoint, { ...options, headers });
}
// --- 1. THEME TOGGLE ---
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const htmlEl = document.documentElement;

// Check saved theme
if (localStorage.getItem('theme') === 'light') {
    htmlEl.setAttribute('data-theme', 'light');
    themeIcon.classList.replace('ph-sun', 'ph-moon');
}

themeToggle.addEventListener('click', () => {
    const currentTheme = htmlEl.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    htmlEl.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'light') {
        themeIcon.classList.replace('ph-sun', 'ph-moon');
    } else {
        themeIcon.classList.replace('ph-moon', 'ph-sun');
    }
});

// --- 2. DYNAMIC PLACEHOLDER (TYPEWRITER) ---
const inputField = document.getElementById('task-title');
const placeholders = [
  "Pretend to be productive...",
  "Ignore procrastination...",
  "Defeat your inner sloth...",
  "Cross off something easy...",
  "Find where the motivation went...",
  "Convince yourself to start...",
  "Win the battle against tomorrow...",
  "Survive today's checklist...",
  "Finally do that one task...",
  "Stop staring at the list...",
  "Tame the task monster...",
  "Outsmart your to-do list...",
  "Make future you proud...",
  "Turn chaos into checkmarks...",
  "Pretend this is the last task...",
  "Delete a task you finished weeks ago...",
  "Check if it's actually done...",
  "Reward yourself too early...",
  "Add one more task anyway...",
  "Finish before another idea appears...",
  "Beat the deadline...",
  "Close the 37 open tabs...",
  "Take a strategic snack break...",
  "Silence your excuses...",
  "Level up your productivity...",
  "Unlock 'Inbox Zero' (maybe)...",
  "Avoid creating another to-do list...",
  "Complete literally anything...",
  "Remember why you opened the app...",
  "Collect another satisfying checkmark..."
];
let pIndex = 0, charIndex = 0, isDeleting = false;

function typeEffect() {
    const currentText = placeholders[pIndex];
    if (isDeleting) {
        inputField.setAttribute('placeholder', currentText.substring(0, charIndex - 1));
        charIndex--;
    } else {
        inputField.setAttribute('placeholder', currentText.substring(0, charIndex + 1));
        charIndex++;
    }

    if (!isDeleting && charIndex === currentText.length) {
        isDeleting = true;
        setTimeout(typeEffect, 2000);
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        pIndex = (pIndex + 1) % placeholders.length;
        setTimeout(typeEffect, 500);
    } else {
        setTimeout(typeEffect, isDeleting ? 30 : 80);
    }
}
typeEffect();

// --- 3. KEYBOARD ACCESSIBILITY (POWER USER) ---
// Global Hotkey: Press '/' to focus
document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== inputField) {
        e.preventDefault(); 
        inputField.focus();
    }
});

// Enter to Submit
document.querySelectorAll('#task-title, #task-duration, #task-priority, #task-energy').forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('add-btn').click();
        }
    });
});

// --- 4. STATE MANAGEMENT & FILTERING ---
const backlogContainer = document.getElementById('backlog-container');
let tasks = [];
let lowEnergyMode = false;

// Low Energy Filter Toggle
const filterBtn = document.getElementById('low-energy-filter');
filterBtn.addEventListener('click', () => {
    lowEnergyMode = !lowEnergyMode;
    filterBtn.classList.toggle('active');
    renderTasks();
});

async function loadTasks() {
    const res = await apiFetch('/api/tasks');
    tasks = await res.json();
    renderTasks();
}

function renderTasks() {
    let displayTasks = tasks;
    
    // Apply Low Energy Filter
    if (lowEnergyMode) {
        displayTasks = displayTasks.filter(t => t.energy <= 2);
    }

    if (displayTasks.length === 0) {
        backlogContainer.innerHTML = '<p style="text-align:center; color:var(--text-muted);">Void is empty.</p>';
        return;
    }

    // Render with 2-Minute Rule badge
    backlogContainer.innerHTML = displayTasks.map(t => {
        const isQuickWin = t.duration <= 5 ? `<span class="quick-win-badge"><i class="ph-fill ph-lightning"></i> Quick Win</span>` : '';
        return `
        <div class="task-item ${t.completed ? 'completed' : ''}" data-id="${t.id}">
            <div class="task-info">
                <span class="task-title">${t.title}</span>
                <div class="task-meta">
                    <span><i class="ph ph-clock"></i> ${t.duration}m</span>
                    <span><i class="ph ph-battery-charging"></i> ${t.energy}</span>
                    <span><i class="ph ph-target"></i> ${t.priority}</span>
                    ${isQuickWin}
                </div>
            </div>
            <button class="check-btn"><i class="ph-bold ph-check"></i></button>
        </div>
    `}).join('');
}

// Satisfying Task Completion (Event Delegation)
backlogContainer.addEventListener('click', async (e) => {
    const btn = e.target.closest('.check-btn');
    if (btn) {
        const taskItem = btn.closest('.task-item');
        const taskId = taskItem.dataset.id;
        
        // Immediate UI Update
        taskItem.classList.toggle('completed');

        // Sync with backend
        await apiFetch(`/api/tasks/${taskId}/complete`, { method: 'PUT' });
        
        // Update local state without full re-render to preserve animation
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex > -1) tasks[taskIndex].completed = !tasks[taskIndex].completed;
    }
});

// Add to Void Logic
document.getElementById('add-btn').addEventListener('click', async () => {
    const title = inputField.value.trim();
    if (!title) return;

    const newTask = {
        title: title,
        duration: parseInt(document.getElementById('task-duration').value) || 30,
        priority: parseInt(document.getElementById('task-priority').value) || 3,
        energy: parseInt(document.getElementById('task-energy').value) || 3
    };

    await apiFetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
    });

    inputField.value = '';
    loadTasks();
});

// Decide For Me Logic (Recommendations)
document.getElementById('decide-btn').addEventListener('click', () => {
    const timeAvailable = parseInt(document.getElementById('avail-time').value);
    const currentEnergy = parseInt(document.getElementById('current-energy').value);
    const recommendationContainer = document.getElementById('active-timer'); 
    
    let pendingTasks = tasks.filter(t => !t.completed && t.duration <= timeAvailable);

    if (pendingTasks.length === 0) {
        recommendationContainer.classList.remove('hidden');
        recommendationContainer.innerHTML = `<div style="padding: 1rem; text-align: center; color: var(--text-muted);">No tasks fit this window.</div>`;
        return;
    }

    pendingTasks.sort((a, b) => {
        const aEnergyBonus = (a.energy <= currentEnergy) ? 2 : 0;
        const bEnergyBonus = (b.energy <= currentEnergy) ? 2 : 0;
        // Also boost quick wins
        const aQuickWin = (a.duration <= 5) ? 1 : 0;
        const bQuickWin = (b.duration <= 5) ? 1 : 0;
        return (b.priority + bEnergyBonus + bQuickWin) - (a.priority + aEnergyBonus + aQuickWin);
    });

    const topTasks = pendingTasks.slice(0, 3);
    
    recommendationContainer.classList.remove('hidden');
    recommendationContainer.innerHTML = `
        <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--panel-border);">
            <span style="font-size: 0.75rem; font-weight: 700; color: var(--primary); letter-spacing: 1px; display: block; margin-bottom: 1rem;">TOP RECOMMENDATIONS</span>
            ${topTasks.map(t => `
                <div class="task-item" style="animation: none;">
                    <div class="task-info">
                        <span class="task-title" style="color: var(--text-main);">${t.title}</span>
                        <div class="task-meta">
                            <span><i class="ph ph-clock"></i> ${t.duration}m</span>
                            ${t.duration <= 5 ? `<span class="quick-win-badge"><i class="ph-fill ph-lightning"></i> Quick Win</span>` : ''}
                        </div>
                    </div>
                    <button class="primary-btn" style="height: auto; padding: 0.5rem 1rem; font-size: 0.8rem;" onclick="completeRecommendedTask('${t.id}')">Do It</button>
                </div>
            `).join('')}
        </div>
    `;
});

window.completeRecommendedTask = async function(taskId) {
    await apiFetch(`/api/tasks/${taskId}/complete`, { method: 'PUT' });
    document.getElementById('active-timer').classList.add('hidden');
    loadTasks();
};
// --- 5. CLEAR COMPLETED TASKS ---
document.getElementById('clear-completed-btn').addEventListener('click', async () => {
    // Only proceed if there are actually completed tasks to delete
    const hasCompletedTasks = tasks.some(t => t.completed);
    if (!hasCompletedTasks) return;

    // Optional: Add a quick fade-out animation to completed tasks before deleting
    document.querySelectorAll('.task-item.completed').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'scale(0.9)';
    });

    // Wait a brief moment for the animation, then wipe them from the database
    setTimeout(async () => {
        await apiFetch('/api/tasks/completed', { method: 'DELETE' });
        loadTasks();
    }, 200); // 200ms delay matches typical CSS transition times
});
// Init
loadTasks();