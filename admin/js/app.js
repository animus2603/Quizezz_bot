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
        <div class="card-desc">${order.title}</div>
        <div class="card-price">${order.price} ₸</div>
        <div class="card-meta">
          <span class="user-info">
            👤 ${order.user.full_name || 'Без имени'}
            ${order.user.username ? `(@${order.user.username})` : ''}
          </span>
          <button class="profile-link" onclick="openTelegramLink('${order.telegram_link}')">🔗 Профиль</button>
        </div>
        <div class="card-meta">
          📞 ${order.user.phone || 'Нет телефона'}
          · 🕐 ${order.created_at}
        </div>
        <div class="card-meta">
          <span class="status-badge status-${order.status}">${order.status}</span>
        </div>
        ${order.status === 'awaiting_payment' || order.status === 'payment_review' ? `
          <div class="btn-row">
            <button class="btn-success" onclick="approveOrder(${order.id})">✓ Принять</button>
            <button class="btn-danger" onclick="rejectOrder(${order.id})">✗ Отклонить</button>
          </div>
        ` : ''}
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
      <div class="card listing-card" onclick="openListingDetail(${listing.id})">
        <div class="card-title">${listing.title}</div>
        <div class="card-desc">${listing.description || 'Без описания'}</div>
        <div class="card-price">${listing.price || 'Бесплатно'} ₸</div>
        <div class="card-meta">
          <span class="status-badge status-${listing.status}">${listing.status}</span>
          · ${listing.category}
          ${listing.subcategory ? ` · ${listing.subcategory}` : ''}
        </div>
        <div class="card-meta">
          👤 ${listing.seller.full_name || 'Без имени'}
          ${listing.seller.username ? `(@${listing.seller.username})` : ''}
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error('Error loading listings:', e);
  }
}

async function openListingDetail(listingId) {
  try {
    const res = await fetch(`${API_BASE}/listings/${listingId}`);
    const listing = await res.json();

    const html = `
      <div class="modal">
        <div class="modal-header">
          <h3>Редактировать объявление #${listing.id}</h3>
          <button class="btn-close" onclick="closeListingModal()">✕</button>
        </div>
        <div class="modal-body">
          <label>Название</label>
          <input type="text" id="edit-title" value="${listing.title}">
          <label>Описание</label>
          <textarea id="edit-description">${listing.description || ''}</textarea>
          <label>Цена (₸)</label>
          <input type="number" id="edit-price" value="${listing.price || ''}">
          <label>Показывать до (дата)</label>
          <input type="date" id="edit-expires" value="${listing.expires_at || ''}">
          <label>Контакт</label>
          <input type="text" id="edit-contact" value="${listing.contact}">
          <div class="btn-row">
            <button class="btn-success" onclick="saveListing(${listing.id})">💾 Сохранить</button>
            <button class="btn-danger" onclick="deleteListing(${listing.id})">🗑️ Удалить</button>
          </div>
          <div class="listing-info">
            <div><strong>Продавец:</strong> ${listing.seller.full_name}</div>
            <div><strong>Телефон:</strong> ${listing.seller.phone || 'Нет'}</div>
            <div><strong>Категория:</strong> ${listing.category}</div>
            <div><strong>Тип:</strong> ${listing.subcategory || 'Не указан'}</div>
            <div><strong>Создано:</strong> ${listing.created_at}</div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('quiz-form-overlay').innerHTML = html;
    document.getElementById('quiz-form-overlay').classList.remove('hidden');
  } catch (e) {
    console.error('Error loading listing detail:', e);
    alert('Ошибка при загрузке объявления');
  }
}

function closeListingModal() {
  document.getElementById('quiz-form-overlay').classList.add('hidden');
}

async function saveListing(listingId) {
  const title = document.getElementById('edit-title').value;
  const description = document.getElementById('edit-description').value;
  const price = parseInt(document.getElementById('edit-price').value);
  const expiresAt = document.getElementById('edit-expires').value;
  const contact = document.getElementById('edit-contact').value;

  try {
    const res = await fetch(`${API_BASE}/listings/${listingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        price,
        expires_at: expiresAt || null,
        contact,
      })
    });

    if (res.ok) {
      closeListingModal();
      loadListings();
      alert('Объявление обновлено');
    } else {
      alert('Ошибка при обновлении');
    }
  } catch (e) {
    console.error('Error saving listing:', e);
    alert('Ошибка при обновлении');
  }
}

async function deleteListing(listingId) {
  if (!confirm('Удалить это объявление?')) return;

  try {
    const res = await fetch(`${API_BASE}/listings/${listingId}`, { method: 'DELETE' });
    if (res.ok) {
      closeListingModal();
      loadListings();
      alert('Объявление удалено');
    } else {
      alert('Ошибка при удалении');
    }
  } catch (e) {
    console.error('Error deleting listing:', e);
    alert('Ошибка при удалении');
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
      <div class="card user-card">
        <div class="user-header">
          <div class="user-avatar">
            ${user.username ? `@${user.username[0].toUpperCase()}` : '👤'}
          </div>
          <div class="user-info">
            <div class="user-name">${user.full_name || 'Без имени'}</div>
            <div class="user-username">@${user.username || 'no username'}</div>
          </div>
          <div class="user-status">
            ${user.is_admin ? '<span class="admin-badge-small">Админ</span>' : '<span class="guest-badge-small">Гость</span>'}
          </div>
        </div>
        <div class="user-details">
          <div class="user-detail">
            <span class="detail-label">🆔 ID:</span>
            <span class="detail-value">${user.tg_id}</span>
          </div>
          <div class="user-detail">
            <span class="detail-label">📞 Телефон:</span>
            <span class="detail-value">${user.phone || 'Не привязан'}</span>
          </div>
          <div class="user-detail">
            <span class="detail-label">💎 Баллы:</span>
            <span class="detail-value">${user.points}</span>
          </div>
          <div class="user-detail">
            <span class="detail-label">📅 Регистрация:</span>
            <span class="detail-value">${user.created_at}</span>
          </div>
        </div>
        <div class="user-actions">
          <button class="profile-link" onclick="openTelegramLink('${user.telegram_link}')">🔗 Профиль</button>
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error('Error loading users:', e);
  }
}

// ---------- Утилиты ----------

function openTelegramLink(url) {
  if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.openTelegramLink(url);
  } else {
    window.open(url, '_blank');
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

async function approveOrder(orderId) {
  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}/approve`, { method: 'POST' });
    if (res.ok) {
      loadOrders();
      alert('Заказ принят');
    } else {
      alert('Ошибка при принятии заказа');
    }
  } catch (e) {
    console.error('Error approving order:', e);
    alert('Ошибка при принятии заказа');
  }
}

async function rejectOrder(orderId) {
  const reason = prompt('Укажите причину отказа:');
  if (!reason) return;

  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    if (res.ok) {
      loadOrders();
      alert('Заказ отклонён');
    } else {
      alert('Ошибка при отклонении заказа');
    }
  } catch (e) {
    console.error('Error rejecting order:', e);
    alert('Ошибка при отклонении заказа');
  }
}

async function editQuiz(id) {
  try {
    const res = await fetch(`${API_BASE}/quizzes/${id}`);
    const quiz = await res.json();

    // Загрузить факультеты
    const facRes = await fetch(`${API_BASE}/cascade/faculties`);
    const faculties = await facRes.json();
    const facultySelect = document.getElementById('quiz-faculty');
    facultySelect.innerHTML = '<option value="">Выберите факультет...</option>' +
      faculties.map(f => `<option value="${f}">${f}</option>`).join('');

    // Установить значение и загрузить кафедры
    facultySelect.value = quiz.faculty;
    if (quiz.faculty) {
      const deptRes = await fetch(`${API_BASE}/cascade/departments?faculty=${encodeURIComponent(quiz.faculty)}`);
      const departments = await deptRes.json();
      const deptSelect = document.getElementById('quiz-department');
      deptSelect.disabled = false;
      deptSelect.innerHTML = '<option value="">Выберите кафедру...</option>' +
        departments.map(d => `<option value="${d}">${d}</option>`).join('');
      deptSelect.value = quiz.department;

      // Загрузить группы
      if (quiz.department) {
        const groupRes = await fetch(`${API_BASE}/cascade/groups?faculty=${encodeURIComponent(quiz.faculty)}&department=${encodeURIComponent(quiz.department)}`);
        const groups = await groupRes.json();
        const groupSelect = document.getElementById('quiz-group');
        groupSelect.disabled = false;
        groupSelect.innerHTML = '<option value="">Выберите группу...</option>' +
          groups.map(g => `<option value="${g}">${g}</option>`).join('');
        groupSelect.value = quiz.group_name;
      }
    }

    document.getElementById('quiz-title').value = quiz.title;
    document.getElementById('quiz-subject').value = quiz.subject;
    document.getElementById('quiz-description').value = quiz.description;
    document.getElementById('quiz-course').value = quiz.course;
    document.getElementById('quiz-price').value = quiz.price;
    document.getElementById('quiz-file-url').value = quiz.file_url;
    document.getElementById('quiz-preview').value = quiz.preview_text;

    document.getElementById('quiz-form-overlay').classList.remove('hidden');
    document.getElementById('btn-save-quiz').dataset.id = id;
  } catch (e) {
    console.error('Error loading quiz:', e);
    alert('Ошибка при загрузке теста');
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
        file_url: fileUrl || '',
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
      document.getElementById('quiz-department').disabled = true;
      document.getElementById('quiz-group').value = '';
      document.getElementById('quiz-group').disabled = true;
      document.getElementById('quiz-course').value = '1';
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

// ---------- Каскадные селекты для тестов ----------

document.getElementById('quiz-faculty').addEventListener('change', async (e) => {
  const faculty = e.target.value;
  const deptSelect = document.getElementById('quiz-department');
  const groupSelect = document.getElementById('quiz-group');

  if (!faculty) {
    deptSelect.disabled = true;
    deptSelect.innerHTML = '<option value="">Сначала выберите факультет</option>';
    groupSelect.disabled = true;
    groupSelect.innerHTML = '<option value="">Сначала выберите факультет и кафедру</option>';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/cascade/departments?faculty=${encodeURIComponent(faculty)}`);
    const departments = await res.json();

    deptSelect.disabled = false;
    deptSelect.innerHTML = '<option value="">Выберите кафедру...</option>' +
      departments.map(d => `<option value="${d}">${d}</option>`).join('');
    
    groupSelect.disabled = true;
    groupSelect.innerHTML = '<option value="">Сначала выберите кафедру</option>';
  } catch (e) {
    console.error('Error loading departments:', e);
  }
});

document.getElementById('quiz-department').addEventListener('change', async (e) => {
  const faculty = document.getElementById('quiz-faculty').value;
  const department = e.target.value;
  const groupSelect = document.getElementById('quiz-group');

  if (!department) {
    groupSelect.disabled = true;
    groupSelect.innerHTML = '<option value="">Сначала выберите кафедру</option>';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/cascade/groups?faculty=${encodeURIComponent(faculty)}&department=${encodeURIComponent(department)}`);
    const groups = await res.json();

    groupSelect.disabled = false;
    groupSelect.innerHTML = '<option value="">Выберите группу...</option>' +
      groups.map(g => `<option value="${g}">${g}</option>`).join('');
  } catch (e) {
    console.error('Error loading groups:', e);
  }
});

// Загрузка факультетов при открытии формы
document.getElementById('btn-add-quiz').addEventListener('click', async () => {
  document.getElementById('quiz-form-overlay').classList.remove('hidden');
  
  try {
    const res = await fetch(`${API_BASE}/cascade/faculties`);
    const faculties = await res.json();

    const facultySelect = document.getElementById('quiz-faculty');
    facultySelect.innerHTML = '<option value="">Выберите факультет...</option>' +
      faculties.map(f => `<option value="${f}">${f}</option>`).join('');
  } catch (e) {
    console.error('Error loading faculties:', e);
  }
});

// ---------- Настройки ----------

document.querySelector('[data-tab="settings"]').addEventListener('click', loadSettings);

async function loadSettings() {
  // Инициализация дефолтных данных
  try {
    await fetch(`${API_BASE}/settings/init-defaults`, { method: 'POST' });
  } catch (e) {
    console.error('Error initializing defaults:', e);
  }

  // Загрузка факультетов
  try {
    const res = await fetch(`${API_BASE}/settings/faculties`);
    const faculties = await res.json();
    const container = document.getElementById('faculties-list');
    container.innerHTML = faculties.map(f => `
      <div class="settings-item">
        <span>${f.name}</span>
        <button class="btn-danger" onclick="deleteFaculty(${f.id})">✕</button>
      </div>
    `).join('');
  } catch (e) {
    console.error('Error loading faculties:', e);
  }

  // Загрузка кафедр
  try {
    const res = await fetch(`${API_BASE}/settings/departments`);
    const departments = await res.json();
    const container = document.getElementById('departments-list');
    container.innerHTML = departments.map(d => `
      <div class="settings-item">
        <span>${d.name}</span>
        <button class="btn-danger" onclick="deleteDepartment(${d.id})">✕</button>
      </div>
    `).join('');
  } catch (e) {
    console.error('Error loading departments:', e);
  }

  // Загрузка групп
  try {
    const res = await fetch(`${API_BASE}/settings/groups`);
    const groups = await res.json();
    const container = document.getElementById('groups-list');
    container.innerHTML = groups.map(g => `
      <div class="settings-item">
        <span>${g.name}</span>
        <button class="btn-danger" onclick="deleteGroup(${g.id})">✕</button>
      </div>
    `).join('');
  } catch (e) {
    console.error('Error loading groups:', e);
  }

  // Загрузка баннеров
  try {
    const res = await fetch(`${API_BASE}/settings/banners`);
    const banners = await res.json();
    const container = document.getElementById('banners-list');
    container.innerHTML = banners.map(b => `
      <div class="settings-item">
        <span>${b.title}</span>
        <button class="btn-danger" onclick="deleteBanner(${b.id})">✕</button>
      </div>
    `).join('');
  } catch (e) {
    console.error('Error loading banners:', e);
  }

  // Загрузка рекламы
  try {
    const res = await fetch(`${API_BASE}/settings/ads`);
    const ads = await res.json();
    const container = document.getElementById('ads-list');
    container.innerHTML = ads.map(a => `
      <div class="settings-item">
        <span>${a.title}</span>
        <button class="btn-danger" onclick="deleteAd(${a.id})">✕</button>
      </div>
    `).join('');
  } catch (e) {
    console.error('Error loading ads:', e);
  }

  // Загрузка FAQ
  try {
    const res = await fetch(`${API_BASE}/settings/faq`);
    const faqs = await res.json();
    const container = document.getElementById('faq-list');
    container.innerHTML = faqs.map(f => `
      <div class="settings-item">
        <span>${f.question.substring(0, 30)}...</span>
        <button class="btn-danger" onclick="deleteFAQ(${f.id})">✕</button>
      </div>
    `).join('');
  } catch (e) {
    console.error('Error loading FAQ:', e);
  }

  // Загрузка информации о поддержке
  try {
    const res = await fetch(`${API_BASE}/settings/support`);
    const support = await res.json();
    document.getElementById('support-whatsapp').value = support.whatsapp || '';
    document.getElementById('support-instagram').value = support.instagram || '';
    document.getElementById('support-tiktok').value = support.tiktok || '';
    document.getElementById('support-email').value = support.email || '';
    document.getElementById('support-telegram').value = support.telegram || '';
  } catch (e) {
    console.error('Error loading support settings:', e);
  }

  // Загрузка названия приложения
  try {
    const res = await fetch(`${API_BASE}/settings/app`);
    const app = await res.json();
    document.getElementById('app-name-input').value = app.app_name || 'Bereket';
    if (app.app_icon) {
      document.getElementById('current-icon').innerHTML = `<img src="${app.app_icon}" alt="Icon">`;
    }
  } catch (e) {
    console.error('Error loading app settings:', e);
  }
}

// ===== Модальные окна для настроек =====

function openFacultyModal() {
  document.getElementById('faculty-modal').classList.remove('hidden');
}

function closeFacultyModal() {
  document.getElementById('faculty-modal').classList.add('hidden');
  document.getElementById('faculty-name').value = '';
}

function openDepartmentModal() {
  document.getElementById('department-modal').classList.remove('hidden');
  loadFacultiesForDepartment();
}

function closeDepartmentModal() {
  document.getElementById('department-modal').classList.add('hidden');
  document.getElementById('department-name').value = '';
  document.getElementById('department-faculty').value = '';
}

function openGroupModal() {
  document.getElementById('group-modal').classList.remove('hidden');
  loadFacultiesForGroup();
}

function closeGroupModal() {
  document.getElementById('group-modal').classList.add('hidden');
  document.getElementById('group-name').value = '';
  document.getElementById('group-faculty').value = '';
  document.getElementById('group-department').value = '';
  document.getElementById('group-department').disabled = true;
}

function openBannerModal() {
  document.getElementById('banner-modal').classList.remove('hidden');
}

function closeBannerModal() {
  document.getElementById('banner-modal').classList.add('hidden');
  document.getElementById('banner-title').value = '';
  document.getElementById('banner-image-url').value = '';
  document.getElementById('banner-link-url').value = '';
  document.getElementById('banner-order').value = '0';
  document.getElementById('banner-preview').innerHTML = '';
}

function openAdModal() {
  document.getElementById('ad-modal').classList.remove('hidden');
}

function closeAdModal() {
  document.getElementById('ad-modal').classList.add('hidden');
  document.getElementById('ad-title').value = '';
  document.getElementById('ad-description').value = '';
  document.getElementById('ad-image-url').value = '';
  document.getElementById('ad-link-url').value = '';
  document.getElementById('ad-order').value = '0';
  document.getElementById('ad-preview').innerHTML = '';
}

function openFAQModal() {
  document.getElementById('faq-modal').classList.remove('hidden');
}

function closeFAQModal() {
  document.getElementById('faq-modal').classList.add('hidden');
  document.getElementById('faq-question').value = '';
  document.getElementById('faq-answer').value = '';
  document.getElementById('faq-order').value = '0';
}

function openSupportModal() {
  document.getElementById('support-modal').classList.remove('hidden');
}

function closeSupportModal() {
  document.getElementById('support-modal').classList.add('hidden');
}

function openAppNameModal() {
  document.getElementById('app-name-modal').classList.remove('hidden');
}

function closeAppNameModal() {
  document.getElementById('app-name-modal').classList.add('hidden');
}

function openIconModal() {
  document.getElementById('icon-modal').classList.remove('hidden');
}

function closeIconModal() {
  document.getElementById('icon-modal').classList.add('hidden');
  document.getElementById('icon-url').value = '';
  document.getElementById('icon-file').value = '';
  document.getElementById('icon-preview').innerHTML = '';
}

// ===== Загрузка данных для селектов =====

async function loadFacultiesForDepartment() {
  try {
    const res = await fetch(`${API_BASE}/settings/faculties`);
    const faculties = await res.json();
    const select = document.getElementById('department-faculty');
    select.innerHTML = '<option value="">Выберите факультет...</option>' +
      faculties.map(f => `<option value="${f.id}">${f.name}</option>`).join('');
  } catch (e) {
    console.error('Error loading faculties:', e);
  }
}

async function loadFacultiesForGroup() {
  try {
    const res = await fetch(`${API_BASE}/settings/faculties`);
    const faculties = await res.json();
    const select = document.getElementById('group-faculty');
    select.innerHTML = '<option value="">Выберите факультет...</option>' +
      faculties.map(f => `<option value="${f.id}">${f.name}</option>`).join('');
  } catch (e) {
    console.error('Error loading faculties:', e);
  }
}

document.getElementById('group-faculty').addEventListener('change', async (e) => {
  const facultyId = e.target.value;
  const deptSelect = document.getElementById('group-department');

  if (!facultyId) {
    deptSelect.disabled = true;
    deptSelect.innerHTML = '<option value="">Сначала выберите факультет</option>';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/settings/departments?faculty_id=${facultyId}`);
    const departments = await res.json();
    deptSelect.disabled = false;
    deptSelect.innerHTML = '<option value="">Выберите кафедру...</option>' +
      departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
  } catch (e) {
    console.error('Error loading departments:', e);
  }
});

// ===== Превью изображений =====

document.getElementById('banner-image-url').addEventListener('input', (e) => {
  const url = e.target.value;
  const preview = document.getElementById('banner-preview');
  if (url) {
    preview.innerHTML = `<img src="${url}" alt="Preview">`;
  } else {
    preview.innerHTML = '';
  }
});

document.getElementById('ad-image-url').addEventListener('input', (e) => {
  const url = e.target.value;
  const preview = document.getElementById('ad-preview');
  if (url) {
    preview.innerHTML = `<img src="${url}" alt="Preview">`;
  } else {
    preview.innerHTML = '';
  }
});

document.getElementById('icon-url').addEventListener('input', (e) => {
  const url = e.target.value;
  const preview = document.getElementById('icon-preview');
  if (url) {
    preview.innerHTML = `<img src="${url}" alt="Preview">`;
  } else {
    preview.innerHTML = '';
  }
});

document.getElementById('banner-file').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const preview = document.getElementById('banner-preview');
    preview.innerHTML = `<img src="${URL.createObjectURL(file)}" alt="Preview">`;
  }
});

document.getElementById('ad-file').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const preview = document.getElementById('ad-preview');
    preview.innerHTML = `<img src="${URL.createObjectURL(file)}" alt="Preview">`;
  }
});

document.getElementById('icon-file').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const preview = document.getElementById('icon-preview');
    preview.innerHTML = `<img src="${URL.createObjectURL(file)}" alt="Preview">`;
  }
});

// ===== Сохранение данных =====

document.getElementById('btn-save-faculty').addEventListener('click', async () => {
  const name = document.getElementById('faculty-name').value;
  if (!name) {
    alert('Введите название факультета');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/settings/faculties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    if (res.ok) {
      closeFacultyModal();
      loadSettings();
      alert('Факультет добавлен');
    } else {
      alert('Ошибка при добавлении факультета');
    }
  } catch (e) {
    console.error('Error creating faculty:', e);
    alert('Ошибка при добавлении факультета');
  }
});

document.getElementById('btn-save-department').addEventListener('click', async () => {
  const name = document.getElementById('department-name').value;
  const facultyId = document.getElementById('department-faculty').value;
  if (!name || !facultyId) {
    alert('Заполните все поля');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/settings/departments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, faculty_id: parseInt(facultyId) })
    });
    if (res.ok) {
      closeDepartmentModal();
      loadSettings();
      alert('Кафедра добавлена');
    } else {
      alert('Ошибка при добавлении кафедры');
    }
  } catch (e) {
    console.error('Error creating department:', e);
    alert('Ошибка при добавлении кафедры');
  }
});

document.getElementById('btn-save-group').addEventListener('click', async () => {
  const name = document.getElementById('group-name').value;
  const facultyId = document.getElementById('group-faculty').value;
  const departmentId = document.getElementById('group-department').value;
  if (!name || !facultyId || !departmentId) {
    alert('Заполните все поля');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/settings/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, faculty_id: parseInt(facultyId), department_id: parseInt(departmentId) })
    });
    if (res.ok) {
      closeGroupModal();
      loadSettings();
      alert('Группа добавлена');
    } else {
      alert('Ошибка при добавлении группы');
    }
  } catch (e) {
    console.error('Error creating group:', e);
    alert('Ошибка при добавлении группы');
  }
});

document.getElementById('btn-save-banner').addEventListener('click', async () => {
  const title = document.getElementById('banner-title').value;
  const imageUrl = document.getElementById('banner-image-url').value;
  const file = document.getElementById('banner-file').files[0];
  const linkUrl = document.getElementById('banner-link-url').value;
  const order = parseInt(document.getElementById('banner-order').value) || 0;
  if (!title || !linkUrl) {
    alert('Заполните название и ссылку');
    return;
  }
  if (!imageUrl && !file) {
    alert('Введите URL или выберите файл');
    return;
  }

  let finalImageUrl = imageUrl;
  if (file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch('/api/settings/upload-banner', {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();
      finalImageUrl = uploadData.url;
    } catch (e) {
      console.error('Error uploading banner:', e);
      alert('Ошибка при загрузке файла');
      return;
    }
  }

  try {
    const res = await fetch(`${API_BASE}/settings/banners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, image_url: finalImageUrl, link_url: linkUrl, order })
    });
    if (res.ok) {
      closeBannerModal();
      loadSettings();
      alert('Баннер добавлен');
    } else {
      alert('Ошибка при добавлении баннера');
    }
  } catch (e) {
    console.error('Error creating banner:', e);
    alert('Ошибка при добавлении баннера');
  }
});

document.getElementById('btn-save-ad').addEventListener('click', async () => {
  const title = document.getElementById('ad-title').value;
  const description = document.getElementById('ad-description').value;
  const imageUrl = document.getElementById('ad-image-url').value;
  const file = document.getElementById('ad-file').files[0];
  const linkUrl = document.getElementById('ad-link-url').value;
  const order = parseInt(document.getElementById('ad-order').value) || 0;
  if (!title || !linkUrl) {
    alert('Заполните название и ссылку');
    return;
  }
  if (!imageUrl && !file) {
    alert('Введите URL или выберите файл');
    return;
  }

  let finalImageUrl = imageUrl;
  if (file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch('/api/settings/upload-banner', {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();
      finalImageUrl = uploadData.url;
    } catch (e) {
      console.error('Error uploading ad image:', e);
      alert('Ошибка при загрузке файла');
      return;
    }
  }

  try {
    const res = await fetch(`${API_BASE}/settings/ads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, image_url: finalImageUrl, link_url: linkUrl, order })
    });
    if (res.ok) {
      closeAdModal();
      loadSettings();
      alert('Реклама добавлена');
    } else {
      alert('Ошибка при добавлении рекламы');
    }
  } catch (e) {
    console.error('Error creating ad:', e);
    alert('Ошибка при добавлении рекламы');
  }
});

document.getElementById('btn-save-faq').addEventListener('click', async () => {
  const question = document.getElementById('faq-question').value;
  const answer = document.getElementById('faq-answer').value;
  const order = parseInt(document.getElementById('faq-order').value) || 0;
  if (!question || !answer) {
    alert('Заполните вопрос и ответ');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/settings/faq`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answer, order })
    });
    if (res.ok) {
      closeFAQModal();
      loadSettings();
      alert('FAQ добавлен');
    } else {
      alert('Ошибка при добавлении FAQ');
    }
  } catch (e) {
    console.error('Error creating FAQ:', e);
    alert('Ошибка при добавлении FAQ');
  }
});

document.getElementById('btn-save-support').addEventListener('click', async () => {
  const whatsapp = document.getElementById('support-whatsapp').value;
  const instagram = document.getElementById('support-instagram').value;
  const tiktok = document.getElementById('support-tiktok').value;
  const email = document.getElementById('support-email').value;
  const telegram = document.getElementById('support-telegram').value;

  try {
    const res = await fetch(`${API_BASE}/settings/support`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ whatsapp, instagram, tiktok, email, telegram })
    });
    if (res.ok) {
      closeSupportModal();
      loadSettings();
      alert('Настройки поддержки обновлены');
    } else {
      alert('Ошибка при обновлении настроек');
    }
  } catch (e) {
    console.error('Error updating support settings:', e);
    alert('Ошибка при обновлении настроек');
  }
});

document.getElementById('btn-save-app-name').addEventListener('click', async () => {
  const name = document.getElementById('app-name-input').value;
  if (!name) {
    alert('Введите название');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/settings/app`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_name: name })
    });
    if (res.ok) {
      closeAppNameModal();
      loadSettings();
      alert('Название обновлено');
    } else {
      alert('Ошибка при обновлении названия');
    }
  } catch (e) {
    console.error('Error updating app name:', e);
    alert('Ошибка при обновлении названия');
  }
});

document.getElementById('btn-save-icon').addEventListener('click', async () => {
  const url = document.getElementById('icon-url').value;
  const file = document.getElementById('icon-file').files[0];

  if (!url && !file) {
    alert('Введите URL или выберите файл');
    return;
  }

  let iconUrl = url;
  if (file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch('/api/settings/upload-icon', {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();
      iconUrl = uploadData.url;
    } catch (e) {
      console.error('Error uploading icon:', e);
      alert('Ошибка при загрузке файла');
      return;
    }
  }

  try {
    const res = await fetch(`${API_BASE}/settings/app`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_icon: iconUrl })
    });
    if (res.ok) {
      closeIconModal();
      loadSettings();
      alert('Иконка обновлена');
    } else {
      alert('Ошибка при обновлении иконки');
    }
  } catch (e) {
    console.error('Error updating app icon:', e);
    alert('Ошибка при обновлении иконки');
  }
});

// ===== Удаление =====

async function deleteFaculty(id) {
  if (confirm('Удалить факультет?')) {
    try {
      const res = await fetch(`${API_BASE}/settings/faculties/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadSettings();
        alert('Факультет удалён');
      } else {
        alert('Ошибка при удалении');
      }
    } catch (e) {
      console.error('Error deleting faculty:', e);
      alert('Ошибка при удалении');
    }
  }
}

async function deleteDepartment(id) {
  if (confirm('Удалить кафедру?')) {
    try {
      const res = await fetch(`${API_BASE}/settings/departments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadSettings();
        alert('Кафедра удалена');
      } else {
        alert('Ошибка при удалении');
      }
    } catch (e) {
      console.error('Error deleting department:', e);
      alert('Ошибка при удалении');
    }
  }
}

async function deleteGroup(id) {
  if (confirm('Удалить группу?')) {
    try {
      const res = await fetch(`${API_BASE}/settings/groups/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadSettings();
        alert('Группа удалена');
      } else {
        alert('Ошибка при удалении');
      }
    } catch (e) {
      console.error('Error deleting group:', e);
      alert('Ошибка при удалении');
    }
  }
}

async function deleteBanner(id) {
  if (confirm('Удалить баннер?')) {
    try {
      const res = await fetch(`${API_BASE}/settings/banners/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadSettings();
        alert('Баннер удалён');
      } else {
        alert('Ошибка при удалении');
      }
    } catch (e) {
      console.error('Error deleting banner:', e);
      alert('Ошибка при удалении');
    }
  }
}

async function deleteAd(id) {
  if (confirm('Удалить рекламу?')) {
    try {
      const res = await fetch(`${API_BASE}/settings/ads/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadSettings();
        alert('Реклама удалена');
      } else {
        alert('Ошибка при удалении');
      }
    } catch (e) {
      console.error('Error deleting ad:', e);
      alert('Ошибка при удалении');
    }
  }
}

async function deleteFAQ(id) {
  if (confirm('Удалить FAQ?')) {
    try {
      const res = await fetch(`${API_BASE}/settings/faq/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadSettings();
        alert('FAQ удалён');
      } else {
        alert('Ошибка при удалении');
      }
    } catch (e) {
      console.error('Error deleting FAQ:', e);
      alert('Ошибка при удалении');
    }
  }
}
