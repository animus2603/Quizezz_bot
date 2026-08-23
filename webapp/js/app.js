const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// ВАЖНО: на проде укажи реальный адрес бэкенда (тот же домен, куда задеплоил api/main.py)
const API_BASE = window.location.origin + "/api";

const tgUser = tg.initDataUnsafe?.user || {};
const currentUser = {
  tg_id: tgUser.id || 0,
  username: tgUser.username || null,
  full_name: [tgUser.first_name, tgUser.last_name].filter(Boolean).join(" ") || null,
};

function showToast(text) {
  const toast = document.getElementById("toast");
  toast.textContent = text;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 3000);
}

// ---------- Табы ----------
document.querySelectorAll(".tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
  });
});

// ---------- Quizizz: каталог ----------
async function loadCatalog() {
  const list = document.getElementById("catalog-list");
  try {
    const res = await fetch(`${API_BASE}/quiz/catalog`);
    const items = await res.json();
    if (!items.length) {
      list.innerHTML = `<p class="hint">Каталог пока пуст.</p>`;
      return;
    }
    list.innerHTML = items.map((item) => `
      <div class="card">
        <div class="card-title">${item.title}</div>
        <div class="card-desc">${item.description || item.subject || ""}</div>
        <div class="card-price">${item.price}₸</div>
        <button class="btn-primary" onclick="buyReadyQuiz(${item.id})">Купить</button>
      </div>
    `).join("");
  } catch (e) {
    list.innerHTML = `<p class="hint">Не удалось загрузить каталог. Проверьте соединение.</p>`;
  }
}

async function buyReadyQuiz(catalogItemId) {
  try {
    const res = await fetch(`${API_BASE}/quiz/order/ready`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...currentUser, catalog_item_id: catalogItemId }),
    });
    if (!res.ok) throw new Error();
    const order = await res.json();
    showToast(`Заказ #${order.id} создан! Вернитесь в чат с ботом — там реквизиты для оплаты.`);
    tg.close();
  } catch (e) {
    showToast("Ошибка при создании заказа");
  }
}

// ---------- Quizizz: индивидуальный заказ ----------
document.getElementById("btn-custom-order").addEventListener("click", () => {
  document.getElementById("custom-form").classList.toggle("hidden");
});

document.getElementById("cf-submit").addEventListener("click", async () => {
  const fileUrl = document.getElementById("cf-file").value.trim();
  const deadline = document.getElementById("cf-deadline").value;
  const comment = document.getElementById("cf-comment").value.trim();

  if (!deadline) {
    showToast("Укажите дедлайн");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/quiz/order/custom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...currentUser,
        questions_file_url: fileUrl || null,
        deadline: new Date(deadline).toISOString(),
        comment: comment || null,
      }),
    });
    if (!res.ok) throw new Error();
    const order = await res.json();
    showToast(`Заказ #${order.id} оформлен! Вернитесь в чат с ботом для оплаты.`);
    tg.close();
  } catch (e) {
    showToast("Ошибка при оформлении заказа");
  }
});

// ---------- Маркетплейс: лента ----------
async function loadListings() {
  const list = document.getElementById("market-list");
  const category = document.getElementById("market-filter").value;
  const url = category
    ? `${API_BASE}/marketplace/listings?category=${category}`
    : `${API_BASE}/marketplace/listings`;

  try {
    const res = await fetch(url);
    const items = await res.json();
    if (!items.length) {
      list.innerHTML = `<p class="hint">Пока нет объявлений в этой категории.</p>`;
      return;
    }
    list.innerHTML = items.map((item) => `
      <div class="card">
        <div class="card-title">${item.title}</div>
        <div class="card-desc">${item.description || ""}</div>
        ${item.price ? `<div class="card-price">${item.price}₸</div>` : ""}
        <button class="btn-secondary" onclick="window.open('https://t.me/${item.contact.replace('@','')}', '_blank')">
          Написать продавцу
        </button>
      </div>
    `).join("");
  } catch (e) {
    list.innerHTML = `<p class="hint">Не удалось загрузить объявления.</p>`;
  }
}

document.getElementById("market-filter").addEventListener("change", loadListings);

document.getElementById("btn-new-listing").addEventListener("click", () => {
  document.getElementById("listing-form").classList.toggle("hidden");
});

document.getElementById("lf-submit").addEventListener("click", async () => {
  const category = document.getElementById("lf-category").value;
  const title = document.getElementById("lf-title").value.trim();
  const description = document.getElementById("lf-description").value.trim();
  const price = document.getElementById("lf-price").value;
  const contact = document.getElementById("lf-contact").value.trim();

  if (!title || !contact) {
    showToast("Заполните название и контакт");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/marketplace/listings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...currentUser,
        category,
        title,
        description: description || null,
        price: price ? parseInt(price, 10) : null,
        contact,
      }),
    });
    if (!res.ok) throw new Error();
    showToast("Объявление отправлено на модерацию!");
    document.getElementById("listing-form").classList.add("hidden");
  } catch (e) {
    showToast("Ошибка при создании объявления");
  }
});

// ---------- Init ----------
loadCatalog();
loadListings();
