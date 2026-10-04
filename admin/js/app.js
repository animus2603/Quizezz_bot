const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Определяем базовый URL API
// Если в Telegram WebApp, используем тот же домен
// Если локально - localhost
let API_BASE;
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  API_BASE = "http://localhost:8000/api/admin";
} else {
  API_BASE = window.location.origin + "/api/admin";
}

console.log('API_BASE:', API_BASE);

// ---------- Навигация ----------

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');

    const tab = item.dataset.tab;
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');

    loadTab(tab);
  });
});

// ---------- Загрузка данных ----------

async function loadTab(tab) {
  switch(tab) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'orders':
      loadOrders();
      break;
    case 'listings':
      loadListings();
      break;
    case 'quizzes':
      loadQuizzes();
      break;
    case 'users':
      loadUsers();
      break;
  }
}

async function loadDashboard() {
  try {
    console.log('Fetching stats from:', `${API_BASE}/stats`);
    const res = await fetch(`${API_BASE}/stats`);
    console.log('Response status:', res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    console.log('Stats data:', data);

    document.getElementById('stat-users').textContent = data.users || 0;
    document.getElementById('stat-orders').textContent = data.orders || 0;
    document.getElementById('stat-listings').textContent = data.listings || 0;
    document.getElementById('stat-pending').textContent = data.pending || 0;

    loadPendingItems();
  } catch (e) {
    console.error('Error loading dashboard:', e);
    document.getElementById('stat-users').textContent = 'Ошибка';
    document.getElementById('stat-orders').textContent = 'Ошибка';
    document.getElementById('stat-listings').textContent = 'Ошибка';
    document.getElementById('stat-pending').textContent = 'Ошибка';
  }
}

async function loadPendingItems() {
  try {
    const res = await fetch(`${API_BASE}/pending`);
    const items = await res.json();

    const container = document.getElementById('pending-list');
    if (items.length === 0) {
      container.innerHTML = '<div class="card"><div class="card-desc">Нет ожидающих действий</div></div>';
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="card">
        <div class="card-title">${item.title}</div>
        <div class="card-meta">${item.type} · ${item.created_at}</div>
        <div class="btn-row">
          <button class="btn-success" onclick="approveItem('${item.type}', ${item.id})">✓ Принять</button>
          <button class="btn-danger" onclick="rejectItem('${item.type}', ${item.id})">✗ Отклонить</button>
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error('Error loading pending items:', e);
  }
}

async function loadOrders() {
  try {
    const filter = document.getElementById('order-filter').value;
    const res = await fetch(`${API_BASE}/orders?filter=${filter}`);
    const orders = await res.json();

    const container = document.getElementById('orders-list');
    if (orders.length === 0) {
      container.innerHTML = '<div class="card"><div class="card-desc">Нет заказов</div></div>';
      return;
    }

    container.innerHTML = orders.map(order => `
      <div class="card">
        <div class="card-title">Заказ #${order.id}</div>
        <div class="card-desc">${order.type}</div>
        <div class="card-price">${order.price} ₸</div>
        <div class="card-meta">
          <span class="status-badge status-${order.status}">${order.status}</span>
          · ${order.created_at}
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error('Error loading orders:', e);
  }
}

async function loadListings() {
  try {
    const filter = document.getElementById('listing-filter').value;
    const res = await fetch(`${API_BASE}/listings?filter=${filter}`);
    const listings = await res.json();

    const container = document.getElementById('listings-list');
    if (listings.length === 0) {
      container.innerHTML = '<div class="card"><div class="card-desc">Нет объявлений</div></div>';
      return;
    }

    container.innerHTML = listings.map(listing => `
      <div class="card">
        <div class="card-title">${listing.title}</div>
        <div class="card-desc">${listing.description || 'Без описания'}</div>
        <div class="card-price">${listing.price || 'Бесплатно'} ₸</div>
        <div class="card-meta">
          <span class="status-badge status-${listing.status}">${listing.status}</span>
          · ${listing.category}
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error('Error loading listings:', e);
  }
}

async function loadQuizzes() {
  try {
    const search = document.getElementById('quiz-search').value;
    const res = await fetch(`${API_BASE}/quizzes?search=${encodeURIComponent(search)}`);
    const quizzes = await res.json();

    const container = document.getElementById('quizzes-list');
    if (quizzes.length === 0) {
      container.innerHTML = '<div class="card"><div class="card-desc">Нет тестов</div></div>';
      return;
    }

    container.innerHTML = quizzes.map(quiz => `
      <div class="card">
        <div class="card-title">${quiz.title}</div>
        <div class="card-desc">${quiz.subject}</div>
        <div class="card-price">${quiz.price} ₸</div>
        <div class="card-meta">${quiz.created_at}</div>
        <div class="btn-row">
          <button class="btn-success" onclick="editQuiz(${quiz.id})">✏️ Изменить</button>
          <button class="btn-danger" onclick="deleteQuiz(${quiz.id})">🗑️ Удалить</button>
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error('Error loading quizzes:', e);
  }
}

async function loadUsers() {
  try {
    const res = await fetch(`${API_BASE}/users`);
    const users = await res.json();

    const container = document.getElementById('users-list');
    if (users.length === 0) {
      container.innerHTML = '<div class="card"><div class="card-desc">Нет пользователей</div></div>';
      return;
    }

    container.innerHTML = users.map(user => `
      <div class="card">
        <div class="card-title">${user.full_name || 'Без имени'}</div>
        <div class="card-desc">@${user.username || 'no username'}</div>
        <div class="card-meta">ID: ${user.tg_id} · Баллы: ${user.points}</div>
      </div>
    `).join('');
  } catch (e) {
    console.error('Error loading users:', e);
  }
}

// ---------- Действия ----------

async function approveItem(type, id) {
  try {
    const res = await fetch(`${API_BASE}/${type}/${id}/approve`, { method: 'POST' });
    if (res.ok) {
      loadDashboard();
    } else {
      alert('Ошибка при одобрении');
    }
  } catch (e) {
    console.error('Error approving item:', e);
    alert('Ошибка при одобрении');
  }
}

async function rejectItem(type, id) {
  const reason = prompt('Укажите причину отказа:');
  if (!reason) return;

  try {
    const res = await fetch(`${API_BASE}/${type}/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    if (res.ok) {
      loadDashboard();
    } else {
      alert('Ошибка при отклонении');
    }
  } catch (e) {
    console.error('Error rejecting item:', e);
    alert('Ошибка при отклонении');
  }
}

async function editQuiz(id) {
  const title = prompt('Название теста:');
  if (!title) return;

  const price = prompt('Цена (₸):');
  if (!price) return;

  try {
    const res = await fetch(`${API_BASE}/quizzes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, price: parseInt(price) })
    });
    if (res.ok) {
      loadQuizzes();
      alert('Тест обновлён');
    } else {
      alert('Ошибка при обновлении');
    }
  } catch (e) {
    console.error('Error editing quiz:', e);
    alert('Ошибка при обновлении');
  }
}

async function deleteQuiz(id) {
  if (!confirm('Удалить этот тест?')) return;

  try {
    const res = await fetch(`${API_BASE}/quizzes/${id}`, { method: 'DELETE' });
    if (res.ok) {
      loadQuizzes();
      alert('Тест удалён');
    } else {
      alert('Ошибка при удалении');
    }
  } catch (e) {
    console.error('Error deleting quiz:', e);
    alert('Ошибка при удалении');
  }
}

// ---------- Фильтры ----------

document.getElementById('order-filter').addEventListener('change', loadOrders);
document.getElementById('listing-filter').addEventListener('change', loadListings);
document.getElementById('quiz-search').addEventListener('input', loadQuizzes);

// ---------- Инициализация ----------

loadDashboard();

// ---------- Форма добавления теста ----------

document.getElementById('btn-add-quiz').addEventListener('click', () => {
  document.getElementById('quiz-form-overlay').classList.remove('hidden');
});

document.getElementById('btn-close-quiz-form').addEventListener('click', () => {
  document.getElementById('quiz-form-overlay').classList.add('hidden');
});

document.getElementById('btn-save-quiz').addEventListener('click', async () => {
  const title = document.getElementById('quiz-title').value;
  const subject = document.getElementById('quiz-subject').value;
  const description = document.getElementById('quiz-description').value;
  const faculty = document.getElementById('quiz-faculty').value;
  const department = document.getElementById('quiz-department').value;
  const course = document.getElementById('quiz-course').value;
  const group = document.getElementById('quiz-group').value;
  const price = parseInt(document.getElementById('quiz-price').value);
  const fileUrl = document.getElementById('quiz-file-url').value;
  const preview = document.getElementById('quiz-preview').value;

  if (!title || !price) {
    alert('Заполните название и цену');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/quizzes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        subject,
        description,
        faculty,
        department,
        course,
        group_name: group,
        price,
        file_url: fileUrl,
        preview_text: preview
      })
    });

    if (res.ok) {
      document.getElementById('quiz-form-overlay').classList.add('hidden');
      loadQuizzes();
      alert('Тест добавлен');
      // Очистить форму
      document.getElementById('quiz-title').value = '';
      document.getElementById('quiz-subject').value = '';
      document.getElementById('quiz-description').value = '';
      document.getElementById('quiz-faculty').value = '';
      document.getElementById('quiz-department').value = '';
      document.getElementById('quiz-course').value = '';
      document.getElementById('quiz-group').value = '';
      document.getElementById('quiz-price').value = '';
      document.getElementById('quiz-file-url').value = '';
      document.getElementById('quiz-preview').value = '';
    } else {
      alert('Ошибка при добавлении теста');
    }
  } catch (e) {
    console.error('Error adding quiz:', e);
    alert('Ошибка при добавлении теста');
  }
});
