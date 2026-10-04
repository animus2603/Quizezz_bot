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
            ${user.avatar_url
              ? `<img src="${user.avatar_url}" alt="" onerror="this.replaceWith(document.createTextNode(this.dataset.fallback))" data-fallback="${user.username ? user.username[0].toUpperCase() : '👤'}">`
              : (user.username ? user.username[0].toUpperCase() : '👤')}
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

// ---------- Настройки: общие хелперы ----------

const settingsCache = { faculties: [], departments: [], groups: [], banners: [], ads: [], faq: [], support: {}, app: {} };
const UPLOAD_URL = API_BASE.replace(/\/admin$/, '') + '/upload';

// Рекомендуемые размеры картинок — под них свёрстаны карусель баннеров и карточки рекламы в Mini App
const IMAGE_SPECS = {
  banner: { width: 1200, height: 400, label: '1200×400 px (3:1)' },
  ad: { width: 800, height: 450, label: '800×450 px (16:9)' },
  icon: { width: 512, height: 512, label: '512×512 px (1:1), PNG' },
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

function settingsItemHtml(label, editCall, deleteCall, isActive = true, thumbUrl = null) {
  const thumb = thumbUrl ? `<img class="settings-thumb" src="${escapeHtml(thumbUrl)}" alt="">` : '';
  return `
      <div class="settings-item${isActive ? '' : ' inactive'}">
        <span class="settings-item-label">${thumb}<span>${label}${isActive ? '' : ' <em>(скрыто)</em>'}</span></span>
        <div class="settings-item-actions">
          <button class="btn-edit" onclick="${editCall}">✏️ Изменить</button>
          <button class="btn-danger" onclick="${deleteCall}">✕</button>
        </div>
      </div>
    `;
}

function emptyListHtml(text) {
  return `<div class="settings-empty">${text}</div>`;
}

function nameById(list, id) {
  const item = list.find(x => x.id === id);
  return item ? item.name : `ID ${id}`;
}

function formatBytes(bytes) {
  if (bytes == null) return '';
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(2)} МБ`;
}

// Размер картинки в пикселях (+ вес файла, если сервер его отдаёт)
async function getImageInfo(url, file = null) {
  const dims = await new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = url;
  });
  if (!dims) return null;
  let bytes = file ? file.size : null;
  if (bytes == null) {
    try {
      const res = await fetch(url);
      if (res.ok) bytes = (await res.blob()).size;
    } catch (e) { /* чужой домен без CORS — вес неизвестен */ }
  }
  return { ...dims, bytes };
}

function imageInfoText(info, spec) {
  if (!info) return 'Не удалось загрузить изображение';
  let text = `Размер: ${info.width}×${info.height} px`;
  if (info.bytes != null) text += ` · ${formatBytes(info.bytes)}`;
  return text;
}

function imageSizeWarning(info, spec) {
  if (!info || !spec) return '';
  const ratio = info.width / info.height;
  const expected = spec.width / spec.height;
  if (Math.abs(ratio - expected) / expected > 0.1) {
    return `⚠️ Пропорции отличаются от рекомендуемых (${spec.label}) — картинка будет обрезана`;
  }
  if (info.width < spec.width * 0.5) {
    return `⚠️ Картинка маленькая — может выглядеть размыто, лучше ${spec.label}`;
  }
  return '';
}

async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(UPLOAD_URL, { method: 'POST', body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return (await res.json()).url;
}

async function apiSettings(method, path, body = null) {
  const res = await fetch(`${API_BASE}/settings/${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

async function fetchJson(path) {
  const res = await fetch(`${API_BASE}/settings/${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ---------- Настройки: загрузка и отрисовка ----------

async function loadSettings() {
  const keys = ['faculties', 'departments', 'groups', 'banners', 'ads', 'faq', 'support', 'app'];
  const results = await Promise.allSettled(keys.map(key => fetchJson(key)));
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') settingsCache[keys[i]] = r.value;
    else console.error(`Error loading ${keys[i]}:`, r.reason);
  });

  const c = settingsCache;
  document.getElementById('faculties-list').innerHTML = c.faculties.length
    ? c.faculties.map(f => {
        const count = c.departments.filter(d => d.faculty_id === f.id).length;
        return settingsItemHtml(`${escapeHtml(f.name)} <small>· кафедр: ${count}</small>`, `editFaculty(${f.id})`, `deleteFaculty(${f.id})`);
      }).join('')
    : emptyListHtml('Факультетов пока нет');

  document.getElementById('departments-list').innerHTML = c.departments.length
    ? c.departments.map(d => settingsItemHtml(
        `${escapeHtml(d.name)} <small>(${escapeHtml(nameById(c.faculties, d.faculty_id))})</small>`,
        `editDepartment(${d.id})`, `deleteDepartment(${d.id})`
      )).join('')
    : emptyListHtml('Кафедр пока нет');

  document.getElementById('groups-list').innerHTML = c.groups.length
    ? c.groups.map(g => settingsItemHtml(
        `${escapeHtml(g.name)} <small>(${escapeHtml(nameById(c.faculties, g.faculty_id))} / ${escapeHtml(nameById(c.departments, g.department_id))})</small>`,
        `editGroup(${g.id})`, `deleteGroup(${g.id})`
      )).join('')
    : emptyListHtml('Групп пока нет');

  document.getElementById('banners-list').innerHTML = c.banners.length
    ? c.banners.map(b => settingsItemHtml(escapeHtml(b.title), `editBanner(${b.id})`, `deleteBanner(${b.id})`, b.is_active, b.image_url)).join('')
    : emptyListHtml('Баннеров пока нет');

  document.getElementById('ads-list').innerHTML = c.ads.length
    ? c.ads.map(a => settingsItemHtml(escapeHtml(a.title), `editAd(${a.id})`, `deleteAd(${a.id})`, a.is_active, a.image_url)).join('')
    : emptyListHtml('Рекламы пока нет');

  document.getElementById('faq-list').innerHTML = c.faq.length
    ? c.faq.map(f => settingsItemHtml(
        escapeHtml(f.question.length > 40 ? `${f.question.substring(0, 40)}…` : f.question),
        `editFAQ(${f.id})`, `deleteFAQ(${f.id})`, f.is_active
      )).join('')
    : emptyListHtml('Вопросов пока нет');

  const s = c.support || {};
  document.getElementById('support-info').innerHTML = [
    ['✈️ Telegram', s.telegram], ['💬 WhatsApp', s.whatsapp], ['📷 Instagram', s.instagram],
    ['🎵 TikTok', s.tiktok], ['✉️ Email', s.email],
  ].map(([label, value]) => `
      <div class="settings-item"><span>${label}: ${escapeHtml(value || '—')}</span></div>
    `).join('');

  document.getElementById('app-name-info').innerHTML = `
    <div class="settings-item"><span>${escapeHtml(c.app.app_name || '—')}</span></div>
  `;

  renderIconInfo();
  applyAdminFavicon(c.app.app_icon);
}

async function renderIconInfo() {
  const container = document.getElementById('icon-info');
  const icon = settingsCache.app.app_icon;
  const spec = IMAGE_SPECS.icon;
  container.innerHTML = `
    <div class="icon-card">
      <div class="icon-preview-wrap">
        ${icon ? `<img class="icon-preview" src="${escapeHtml(icon)}" alt="">` : '<div class="icon-preview icon-placeholder">🎓</div>'}
      </div>
      <div class="icon-meta">
        <div id="icon-size">${icon ? 'Определяем размер…' : 'Иконка не загружена'}</div>
        <div class="field-hint">Рекомендуемый размер: ${spec.label}</div>
        <div id="icon-warning" class="field-warning"></div>
      </div>
    </div>
    <input type="file" id="icon-file" accept="image/*" hidden onchange="handleIconFile(this)">
    <button class="btn-primary" onclick="document.getElementById('icon-file').click()">⬆️ Загрузить новую иконку</button>
  `;
  if (icon) {
    const info = await getImageInfo(icon);
    document.getElementById('icon-size').textContent = imageInfoText(info, spec);
    document.getElementById('icon-warning').textContent = imageSizeWarning(info, spec);
  }
}

async function handleIconFile(input) {
  const file = input.files[0];
  if (!file) return;
  const sizeEl = document.getElementById('icon-size');
  sizeEl.textContent = 'Загрузка…';
  try {
    const url = await uploadImage(file);
    await apiSettings('PUT', 'app', { app_icon: url });
    await loadSettings();
    alert('Иконка обновлена');
  } catch (e) {
    console.error('Error uploading icon:', e);
    sizeEl.textContent = 'Ошибка загрузки';
    alert(`Ошибка при загрузке иконки: ${e.message}`);
  }
}

function applyAdminFavicon(url) {
  if (!url) return;
  let link = document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = url;
}

// ---------- Полноэкранная форма настроек ----------

let activeSettingsForm = null;

function fieldId(name) {
  return `sf-${name}`;
}

function renderSelectOptions(field, values) {
  const options = field.options(values);
  const current = values[field.name];
  const placeholder = options.length ? (field.placeholder || 'Выберите...') : (field.emptyText || 'Список пуст');
  return `<option value="">${escapeHtml(placeholder)}</option>` + options.map(o =>
    `<option value="${escapeHtml(o.value)}"${String(o.value) === String(current) ? ' selected' : ''}>${escapeHtml(o.label)}</option>`
  ).join('');
}

function renderFormField(field, values) {
  const id = fieldId(field.name);
  const value = values[field.name] ?? '';
  const req = field.required ? ' <span class="req">*</span>' : '';
  const hint = field.hint ? `<div class="field-hint">${field.hint}</div>` : '';
  switch (field.type) {
    case 'textarea':
      return `<div class="form-field"><label for="${id}">${field.label}${req}</label>
        <textarea id="${id}" placeholder="${escapeHtml(field.placeholder || '')}">${escapeHtml(value)}</textarea>${hint}</div>`;
    case 'number':
      return `<div class="form-field"><label for="${id}">${field.label}${req}</label>
        <input id="${id}" type="number" step="1" value="${escapeHtml(value)}">${hint}</div>`;
    case 'checkbox':
      return `<div class="form-field form-field-checkbox"><label class="checkbox-row" for="${id}">
        <input id="${id}" type="checkbox"${value ? ' checked' : ''}> ${field.label}</label>${hint}</div>`;
    case 'select':
      return `<div class="form-field"><label for="${id}">${field.label}${req}</label>
        <select id="${id}" data-select="${field.name}">${renderSelectOptions(field, values)}</select>${hint}</div>`;
    case 'image': {
      const spec = IMAGE_SPECS[field.spec];
      return `<div class="form-field image-field"><label>${field.label}${req}</label>
        <div class="image-preview${value ? '' : ' empty'}" id="${id}-preview"
             style="aspect-ratio: ${spec.width} / ${spec.height}">
          ${value ? `<img src="${escapeHtml(value)}" alt="">` : '<span>Фото не выбрано</span>'}
        </div>
        <div class="field-hint">Рекомендуемый размер: <b>${spec.label}</b>, до 15 МБ</div>
        <div class="field-info" id="${id}-info"></div>
        <div class="field-warning" id="${id}-warning"></div>
        <input type="file" id="${id}-file" accept="image/*" hidden>
        <button type="button" class="btn-secondary" id="${id}-upload">⬆️ ${value ? 'Заменить фото' : 'Загрузить фото'}</button>
        <input id="${id}" type="text" value="${escapeHtml(value)}" placeholder="или вставьте ссылку на изображение https://...">
      </div>`;
    }
    default:
      return `<div class="form-field"><label for="${id}">${field.label}${req}</label>
        <input id="${id}" type="${field.type === 'url' ? 'url' : 'text'}" value="${escapeHtml(value)}"
               placeholder="${escapeHtml(field.placeholder || '')}">${hint}</div>`;
  }
}

function readFormValues(fields) {
  const values = {};
  for (const field of fields) {
    const el = document.getElementById(fieldId(field.name));
    if (!el) continue;
    if (field.type === 'checkbox') values[field.name] = el.checked;
    else if (field.type === 'number') values[field.name] = el.value === '' ? 0 : parseInt(el.value, 10);
    else if (field.type === 'select') values[field.name] = el.value === '' ? null : (field.numeric ? parseInt(el.value, 10) : el.value);
    else values[field.name] = el.value.trim();
  }
  return values;
}

async function updateImageField(field, url, file = null) {
  const id = fieldId(field.name);
  const spec = IMAGE_SPECS[field.spec];
  const preview = document.getElementById(`${id}-preview`);
  const infoEl = document.getElementById(`${id}-info`);
  const warnEl = document.getElementById(`${id}-warning`);
  if (!url) {
    preview.classList.add('empty');
    preview.innerHTML = '<span>Фото не выбрано</span>';
    infoEl.textContent = '';
    warnEl.textContent = '';
    return;
  }
  preview.classList.remove('empty');
  preview.innerHTML = `<img src="${escapeHtml(url)}" alt="">`;
  infoEl.textContent = 'Определяем размер…';
  const info = await getImageInfo(url, file);
  infoEl.textContent = imageInfoText(info, spec);
  warnEl.textContent = imageSizeWarning(info, spec);
}

function bindFormField(field) {
  const id = fieldId(field.name);
  if (field.type === 'image') {
    const urlInput = document.getElementById(id);
    const fileInput = document.getElementById(`${id}-file`);
    const uploadBtn = document.getElementById(`${id}-upload`);
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files[0];
      if (!file) return;
      uploadBtn.disabled = true;
      uploadBtn.textContent = 'Загрузка…';
      try {
        const url = await uploadImage(file);
        urlInput.value = url;
        await updateImageField(field, url, file);
        uploadBtn.textContent = '⬆️ Заменить фото';
      } catch (e) {
        alert(`Ошибка загрузки фото: ${e.message}`);
        uploadBtn.textContent = '⬆️ Загрузить фото';
      } finally {
        uploadBtn.disabled = false;
        fileInput.value = '';
      }
    });
    urlInput.addEventListener('change', () => updateImageField(field, urlInput.value.trim()));
    if (urlInput.value) updateImageField(field, urlInput.value);
  }
  if (field.type === 'select') {
    document.getElementById(id).addEventListener('change', () => {
      // перерисовываем зависимые селекты (например, кафедры после смены факультета)
      const values = readFormValues(activeSettingsForm.fields);
      activeSettingsForm.fields
        .filter(f => f.type === 'select' && f.dependsOn === field.name)
        .forEach(f => {
          values[f.name] = null;
          document.getElementById(fieldId(f.name)).innerHTML = renderSelectOptions(f, values);
        });
    });
  }
}

function openSettingsForm({ title, fields, values = {}, submitLabel = 'Сохранить', onSubmit }) {
  activeSettingsForm = { fields, onSubmit };
  document.getElementById('settings-form-title').textContent = title;
  const form = document.getElementById('settings-form');
  form.innerHTML = fields.map(f => renderFormField(f, values)).join('') + `
    <div class="form-error hidden" id="settings-form-error"></div>
    <div class="form-actions">
      <button type="button" class="btn-secondary" onclick="closeSettingsForm()">Отмена</button>
      <button type="submit" class="btn-primary" id="settings-form-submit">${submitLabel}</button>
    </div>`;
  fields.forEach(bindFormField);
  document.getElementById('settings-form-overlay').classList.remove('hidden');
  document.body.classList.add('no-scroll');
  const first = form.querySelector('input:not([type=file]):not([type=checkbox]), textarea, select');
  if (first) first.focus();
}

function closeSettingsForm() {
  document.getElementById('settings-form-overlay').classList.add('hidden');
  document.body.classList.remove('no-scroll');
  activeSettingsForm = null;
}

function showFormError(text) {
  const el = document.getElementById('settings-form-error');
  el.textContent = text;
  el.classList.toggle('hidden', !text);
}

document.getElementById('settings-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!activeSettingsForm) return;
  const { fields, onSubmit } = activeSettingsForm;
  const values = readFormValues(fields);

  const missing = fields.find(f => f.required && (values[f.name] === null || values[f.name] === ''));
  if (missing) return showFormError(`Заполните поле «${missing.label}»`);
  const badLink = fields.find(f => f.type === 'url' && values[f.name] && !/^(https?:\/\/|tg:\/\/|mailto:)/i.test(values[f.name]));
  if (badLink) return showFormError(`«${badLink.label}» должна начинаться с https://`);
  if (fields.some(f => f.type === 'number' && Number.isNaN(values[f.name]))) return showFormError('Порядок должен быть числом');

  const submitBtn = document.getElementById('settings-form-submit');
  submitBtn.disabled = true;
  showFormError('');
  try {
    await onSubmit(values);
    closeSettingsForm();
    await loadSettings();
  } catch (err) {
    console.error('Error saving settings:', err);
    showFormError(`Ошибка при сохранении: ${err.message}`);
  } finally {
    submitBtn.disabled = false;
  }
});

document.getElementById('settings-form-overlay').addEventListener('click', (e) => {
  if (e.target.id === 'settings-form-overlay') closeSettingsForm();
});

// ---------- Описание форм ----------

const facultyOptions = () => settingsCache.faculties.map(f => ({ value: f.id, label: f.name }));
const departmentOptions = (values) => settingsCache.departments
  .filter(d => d.faculty_id === values.faculty_id)
  .map(d => ({ value: d.id, label: d.name }));

const FACULTY_FIELDS = [
  { name: 'name', label: 'Название факультета', required: true, placeholder: 'Например: Информационные технологии' },
];
const DEPARTMENT_FIELDS = [
  { name: 'name', label: 'Название кафедры', required: true },
  { name: 'faculty_id', label: 'Факультет', type: 'select', numeric: true, required: true, options: facultyOptions,
    emptyText: 'Сначала добавьте факультет' },
];
const GROUP_FIELDS = [
  { name: 'name', label: 'Название группы', required: true, placeholder: 'Например: ИС-21' },
  { name: 'faculty_id', label: 'Факультет', type: 'select', numeric: true, required: true, options: facultyOptions,
    emptyText: 'Сначала добавьте факультет' },
  { name: 'department_id', label: 'Кафедра', type: 'select', numeric: true, required: true, options: departmentOptions,
    dependsOn: 'faculty_id', placeholder: 'Выберите кафедру...', emptyText: 'Сначала выберите факультет (или добавьте кафедру)' },
];

function promoFields(kind) {
  const noun = kind === 'banner' ? 'баннера' : 'рекламы';
  return [
    { name: 'image_url', label: 'Фото', type: 'image', spec: kind, required: true },
    { name: 'title', label: `Название ${noun}`, required: true },
    { name: 'description', label: 'Описание', type: 'textarea', placeholder: 'Короткий текст под названием (необязательно)' },
    { name: 'link_url', label: 'Ссылка', type: 'url', required: true, placeholder: 'https://...',
      hint: `Откроется при нажатии на ${kind === 'banner' ? 'баннер' : 'рекламу'}` },
    { name: 'order', label: 'Порядок показа', type: 'number', hint: 'Меньше — раньше' },
    { name: 'is_active', label: 'Показывать в приложении', type: 'checkbox' },
  ];
}

const FAQ_FIELDS = [
  { name: 'question', label: 'Вопрос', required: true },
  { name: 'answer', label: 'Ответ', type: 'textarea', required: true },
  { name: 'order', label: 'Порядок показа', type: 'number', hint: 'Меньше — выше в списке' },
  { name: 'is_active', label: 'Показывать в приложении', type: 'checkbox' },
];

const SUPPORT_FIELDS = [
  { name: 'telegram', label: 'Telegram', placeholder: 'https://t.me/username или @username' },
  { name: 'whatsapp', label: 'WhatsApp', placeholder: '+7 700 000 00 00' },
  { name: 'instagram', label: 'Instagram', placeholder: 'https://www.instagram.com/...' },
  { name: 'tiktok', label: 'TikTok', placeholder: 'https://www.tiktok.com/@...' },
  { name: 'email', label: 'Email', placeholder: 'support@example.com' },
];

function findCached(key, id) {
  const item = settingsCache[key].find(x => x.id === id);
  if (!item) alert('Запись не найдена, обновите страницу');
  return item;
}

function nextOrder(list) {
  return list.length ? Math.max(...list.map(x => x.order || 0)) + 1 : 0;
}

// ---------- Добавление ----------

function openFacultyModal() {
  openSettingsForm({
    title: 'Новый факультет', fields: FACULTY_FIELDS, submitLabel: 'Добавить',
    onSubmit: v => apiSettings('POST', 'faculties', v),
  });
}

function openDepartmentModal() {
  openSettingsForm({
    title: 'Новая кафедра', fields: DEPARTMENT_FIELDS, submitLabel: 'Добавить',
    onSubmit: v => apiSettings('POST', 'departments', v),
  });
}

function openGroupModal() {
  openSettingsForm({
    title: 'Новая группа', fields: GROUP_FIELDS, submitLabel: 'Добавить',
    onSubmit: v => apiSettings('POST', 'groups', v),
  });
}

function openBannerModal() {
  openSettingsForm({
    title: 'Новый баннер', fields: promoFields('banner'), submitLabel: 'Добавить',
    values: { is_active: true, order: nextOrder(settingsCache.banners) },
    onSubmit: v => apiSettings('POST', 'banners', v),
  });
}

function openAdModal() {
  openSettingsForm({
    title: 'Новая реклама', fields: promoFields('ad'), submitLabel: 'Добавить',
    values: { is_active: true, order: nextOrder(settingsCache.ads) },
    onSubmit: v => apiSettings('POST', 'ads', v),
  });
}

function openFAQModal() {
  openSettingsForm({
    title: 'Новый вопрос FAQ', fields: FAQ_FIELDS, submitLabel: 'Добавить',
    values: { is_active: true, order: nextOrder(settingsCache.faq) },
    onSubmit: v => apiSettings('POST', 'faq', v),
  });
}

function openSupportModal() {
  openSettingsForm({
    title: 'Контакты поддержки', fields: SUPPORT_FIELDS, values: settingsCache.support,
    onSubmit: v => apiSettings('PUT', 'support', v),
  });
}

function openAppNameModal() {
  openSettingsForm({
    title: 'Название приложения',
    fields: [{ name: 'app_name', label: 'Название', required: true }],
    values: settingsCache.app,
    onSubmit: v => apiSettings('PUT', 'app', v),
  });
}

function openIconModal() {
  document.getElementById('icon-file')?.click();
}

// ---------- Изменение ----------

function editFaculty(id) {
  const item = findCached('faculties', id);
  if (!item) return;
  openSettingsForm({
    title: 'Изменить факультет', fields: FACULTY_FIELDS, values: item,
    onSubmit: v => apiSettings('PUT', `faculties/${id}`, v),
  });
}

function editDepartment(id) {
  const item = findCached('departments', id);
  if (!item) return;
  openSettingsForm({
    title: 'Изменить кафедру', fields: DEPARTMENT_FIELDS, values: item,
    onSubmit: v => apiSettings('PUT', `departments/${id}`, v),
  });
}

function editGroup(id) {
  const item = findCached('groups', id);
  if (!item) return;
  openSettingsForm({
    title: 'Изменить группу', fields: GROUP_FIELDS, values: item,
    onSubmit: v => apiSettings('PUT', `groups/${id}`, v),
  });
}

function editBanner(id) {
  const item = findCached('banners', id);
  if (!item) return;
  openSettingsForm({
    title: 'Изменить баннер', fields: promoFields('banner'), values: item,
    onSubmit: v => apiSettings('PUT', `banners/${id}`, { ...v, description: v.description || null }),
  });
}

function editAd(id) {
  const item = findCached('ads', id);
  if (!item) return;
  openSettingsForm({
    title: 'Изменить рекламу', fields: promoFields('ad'), values: item,
    onSubmit: v => apiSettings('PUT', `ads/${id}`, { ...v, description: v.description || null }),
  });
}

function editFAQ(id) {
  const item = findCached('faq', id);
  if (!item) return;
  openSettingsForm({
    title: 'Изменить вопрос FAQ', fields: FAQ_FIELDS, values: item,
    onSubmit: v => apiSettings('PUT', `faq/${id}`, v),
  });
}

// ---------- Удаление ----------

async function deleteSetting(path, id, question) {
  if (!confirm(question)) return;
  try {
    await apiSettings('DELETE', `${path}/${id}`);
    await loadSettings();
  } catch (e) {
    console.error(`Error deleting ${path}:`, e);
    alert(`Ошибка при удалении: ${e.message}`);
  }
}

function deleteFaculty(id) {
  const depCount = settingsCache.departments.filter(d => d.faculty_id === id).length;
  const groupCount = settingsCache.groups.filter(g => g.faculty_id === id).length;
  const extra = depCount || groupCount ? `\nВместе с ним удалятся кафедры (${depCount}) и группы (${groupCount}).` : '';
  deleteSetting('faculties', id, `Удалить факультет «${nameById(settingsCache.faculties, id)}»?${extra}`);
}

function deleteDepartment(id) {
  const groupCount = settingsCache.groups.filter(g => g.department_id === id).length;
  const extra = groupCount ? `\nВместе с ней удалятся группы (${groupCount}).` : '';
  deleteSetting('departments', id, `Удалить кафедру «${nameById(settingsCache.departments, id)}»?${extra}`);
}

function deleteGroup(id) {
  deleteSetting('groups', id, `Удалить группу «${nameById(settingsCache.groups, id)}»?`);
}

function deleteBanner(id) {
  deleteSetting('banners', id, 'Удалить баннер?');
}

function deleteAd(id) {
  deleteSetting('ads', id, 'Удалить рекламу?');
}

function deleteFAQ(id) {
  deleteSetting('faq', id, 'Удалить вопрос FAQ?');
}

// иконка приложения во вкладке браузера и в админке
fetch(`${API_BASE}/settings/app`).then(r => r.json()).then(app => applyAdminFavicon(app.app_icon)).catch(() => {});
