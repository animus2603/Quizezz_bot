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

// ---------- i18n ----------
const LANGS = ["RU", "KZ", "EN"];

const DICT = {
  RU: {
    appName: "StudHub",
    readyQuizzes: "Готовые тесты",
    noQuizFound: "Нет нужного теста?",
    orderCustomBtn: "Заказать индивидуальный тест — 5000₸",
    cfFileLabel: "Ссылка/описание вопросов теста",
    cfFilePlaceholder: "Ссылка на файл или Quizizz",
    cfDeadlineLabel: "Дедлайн (дата и время)",
    cfCommentLabel: "Пожелания / инструкции",
    cfCommentPlaceholder: "Например: нужно 90%+ правильных",
    cfSubmit: "Оформить заказ — 5000₸",
    catAll: "Все категории",
    catGoods: "Товары", catServices: "Услуги", catAds: "Реклама",
    catGoodsSingle: "Товар", catServicesSingle: "Услуга", catAdsSingle: "Реклама",
    newListingBtn: "+ Разместить",
    lfCategoryLabel: "Категория",
    lfTitleLabel: "Название",
    lfTitlePlaceholder: "Например: Учебник по матанализу",
    lfDescLabel: "Описание",
    lfDescPlaceholder: "Состояние, детали...",
    lfPriceLabel: "Цена (₸, необязательно)",
    lfContactLabel: "Контакт (@username)",
    lfSubmit: "Отправить на модерацию",
    myTitle: "Мои заказы и объявления",
    myHint: "Статусы заказов приходят вам личным сообщением от бота.",
    navQuiz: "Тесты", navMarket: "Маркет", navMy: "Профиль",
    buyBtn: "Купить",
    contactSellerBtn: "Написать продавцу",
    emptyCatalog: "Каталог пока пуст.",
    emptyListings: "Пока нет объявлений в этой категории.",
    errCatalog: "Не удалось загрузить каталог. Проверьте соединение.",
    errListings: "Не удалось загрузить объявления.",
    errDeadline: "Укажите дедлайн",
    errFields: "Заполните название и контакт",
    orderCreated: (id) => `Заказ #${id} создан! Вернитесь в чат с ботом — там реквизиты для оплаты.`,
    orderPlaced: (id) => `Заказ #${id} оформлен! Вернитесь в чат с ботом для оплаты.`,
    errOrder: "Ошибка при создании заказа",
    listingSent: "Объявление отправлено на модерацию!",
    errListing: "Ошибка при создании объявления",
    banners: [
      { icon: "🎓", text: "Готовые тесты Quizizz по фиксированной цене — 3000₸" },
      { icon: "⏱️", text: "Нужен тест к дедлайну? Закажем индивидуально — 5000₸" },
      { icon: "🛒", text: "Продавай и находи учебники, технику и услуги рядом" },
    ],
  },
  KZ: {
    appName: "StudHub",
    readyQuizzes: "Дайын тесттер",
    noQuizFound: "Керекті тест жоқ па?",
    orderCustomBtn: "Жеке тест тапсырыс беру — 5000₸",
    cfFileLabel: "Тест сұрақтарының сілтемесі/сипаттамасы",
    cfFilePlaceholder: "Файлға сілтеме немесе Quizizz",
    cfDeadlineLabel: "Мерзімі (күні мен уақыты)",
    cfCommentLabel: "Тілектер / нұсқаулар",
    cfCommentPlaceholder: "Мысалы: 90%+ дұрыс керек",
    cfSubmit: "Тапсырыс беру — 5000₸",
    catAll: "Барлық санаттар",
    catGoods: "Тауарлар", catServices: "Қызметтер", catAds: "Жарнама",
    catGoodsSingle: "Тауар", catServicesSingle: "Қызмет", catAdsSingle: "Жарнама",
    newListingBtn: "+ Хабарландыру беру",
    lfCategoryLabel: "Санат",
    lfTitleLabel: "Атауы",
    lfTitlePlaceholder: "Мысалы: Матанализ оқулығы",
    lfDescLabel: "Сипаттама",
    lfDescPlaceholder: "Жағдайы, толығырақ...",
    lfPriceLabel: "Бағасы (₸, міндетті емес)",
    lfContactLabel: "Байланыс (@username)",
    lfSubmit: "Модерацияға жіберу",
    myTitle: "Менің тапсырыстарым мен хабарландыруларым",
    myHint: "Тапсырыс мәртебелері боттан жеке хабарлама түрінде келеді.",
    navQuiz: "Тесттер", navMarket: "Маркет", navMy: "Профиль",
    buyBtn: "Сатып алу",
    contactSellerBtn: "Сатушыға жазу",
    emptyCatalog: "Каталог әзірге бос.",
    emptyListings: "Бұл санатта хабарландырулар жоқ.",
    errCatalog: "Каталогты жүктеу мүмкін болмады. Байланысты тексеріңіз.",
    errListings: "Хабарландыруларды жүктеу мүмкін болмады.",
    errDeadline: "Мерзімді көрсетіңіз",
    errFields: "Атауы мен байланысты толтырыңыз",
    orderCreated: (id) => `#${id} тапсырысы құрылды! Ботпен чатқа қайтыңыз — онда төлем деректемелері бар.`,
    orderPlaced: (id) => `#${id} тапсырысы рәсімделді! Төлеу үшін ботпен чатқа қайтыңыз.`,
    errOrder: "Тапсырысты құру кезінде қате шықты",
    listingSent: "Хабарландыру модерацияға жіберілді!",
    errListing: "Хабарландыруды құру кезінде қате шықты",
    banners: [
      { icon: "🎓", text: "Дайын Quizizz тесттері бекітілген бағамен — 3000₸" },
      { icon: "⏱️", text: "Мерзімге тест керек пе? Жеке тапсырыс береміз — 5000₸" },
      { icon: "🛒", text: "Оқулық, техника және қызметтерді сатып ал не сат" },
    ],
  },
  EN: {
    appName: "StudHub",
    readyQuizzes: "Ready-made quizzes",
    noQuizFound: "Can't find your quiz?",
    orderCustomBtn: "Order a custom quiz — 5000₸",
    cfFileLabel: "Link/description of quiz questions",
    cfFilePlaceholder: "Link to file or Quizizz",
    cfDeadlineLabel: "Deadline (date and time)",
    cfCommentLabel: "Notes / instructions",
    cfCommentPlaceholder: "E.g.: need 90%+ correct",
    cfSubmit: "Place order — 5000₸",
    catAll: "All categories",
    catGoods: "Goods", catServices: "Services", catAds: "Ads",
    catGoodsSingle: "Item", catServicesSingle: "Service", catAdsSingle: "Ad",
    newListingBtn: "+ Post listing",
    lfCategoryLabel: "Category",
    lfTitleLabel: "Title",
    lfTitlePlaceholder: "E.g.: Calculus textbook",
    lfDescLabel: "Description",
    lfDescPlaceholder: "Condition, details...",
    lfPriceLabel: "Price (₸, optional)",
    lfContactLabel: "Contact (@username)",
    lfSubmit: "Send for moderation",
    myTitle: "My orders and listings",
    myHint: "Order status updates arrive as a direct message from the bot.",
    navQuiz: "Quizzes", navMarket: "Market", navMy: "Profile",
    buyBtn: "Buy",
    contactSellerBtn: "Message seller",
    emptyCatalog: "Catalog is empty right now.",
    emptyListings: "No listings in this category yet.",
    errCatalog: "Couldn't load the catalog. Check your connection.",
    errListings: "Couldn't load listings.",
    errDeadline: "Please set a deadline",
    errFields: "Fill in the title and contact",
    orderCreated: (id) => `Order #${id} created! Go back to the bot chat for payment details.`,
    orderPlaced: (id) => `Order #${id} placed! Go back to the bot chat to pay.`,
    errOrder: "Error creating the order",
    listingSent: "Listing sent for moderation!",
    errListing: "Error creating the listing",
    banners: [
      { icon: "🎓", text: "Ready-made Quizizz tests at a fixed price — 3000₸" },
      { icon: "⏱️", text: "Need a quiz by a deadline? We'll do it custom — 5000₸" },
      { icon: "🛒", text: "Buy and sell textbooks, gadgets and student services" },
    ],
  },
};

let currentLang = "RU";

function t(key) {
  return DICT[currentLang][key] ?? DICT.RU[key];
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const val = t(el.dataset.i18n);
    if (typeof val === "string") el.textContent = val;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const val = t(el.dataset.i18nPlaceholder);
    if (typeof val === "string") el.placeholder = val;
  });
  document.getElementById("lang-switch").textContent = currentLang;
  renderBanner();
  loadCatalog();
  loadListings();
}

document.getElementById("lang-switch").addEventListener("click", () => {
  const idx = LANGS.indexOf(currentLang);
  currentLang = LANGS[(idx + 1) % LANGS.length];
  applyTranslations();
});

function showToast(text) {
  const toast = document.getElementById("toast");
  toast.textContent = text;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 3000);
}

// ---------- Баннер-карусель ----------
let bannerTimer = null;
let bannerIndex = 0;

function renderBanner() {
  const track = document.getElementById("banner-track");
  const dots = document.getElementById("banner-dots");
  const slides = t("banners");

  track.innerHTML = slides.map((s) => `
    <div class="banner-slide">
      <span class="banner-icon">${s.icon}</span>
      <span class="banner-text">${s.text}</span>
    </div>
  `).join("");

  dots.innerHTML = slides.map((_, i) => `<span class="${i === 0 ? "active" : ""}"></span>`).join("");

  bannerIndex = 0;
  track.style.transform = "translateX(0%)";

  if (bannerTimer) clearInterval(bannerTimer);
  bannerTimer = setInterval(() => {
    bannerIndex = (bannerIndex + 1) % slides.length;
    track.style.transform = `translateX(-${bannerIndex * 100}%)`;
    dots.querySelectorAll("span").forEach((d, i) => d.classList.toggle("active", i === bannerIndex));
  }, 4000);
}

// ---------- Нижнее меню ----------
document.querySelectorAll(".nav-item").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((b) => b.classList.remove("active"));
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
      list.innerHTML = `<p class="hint">${t("emptyCatalog")}</p>`;
      return;
    }
    list.innerHTML = items.map((item) => `
      <div class="card">
        <div class="card-title">${item.title}</div>
        <div class="card-desc">${item.description || item.subject || ""}</div>
        <div class="card-price">${item.price}₸</div>
        <button class="btn-primary" onclick="buyReadyQuiz(${item.id})">${t("buyBtn")}</button>
      </div>
    `).join("");
  } catch (e) {
    list.innerHTML = `<p class="hint">${t("errCatalog")}</p>`;
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
    showToast(t("orderCreated")(order.id));
    tg.close();
  } catch (e) {
    showToast(t("errOrder"));
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
    showToast(t("errDeadline"));
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
    showToast(t("orderPlaced")(order.id));
    tg.close();
  } catch (e) {
    showToast(t("errOrder"));
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
      list.innerHTML = `<p class="hint">${t("emptyListings")}</p>`;
      return;
    }
    list.innerHTML = items.map((item) => `
      <div class="card">
        <div class="card-title">${item.title}</div>
        <div class="card-desc">${item.description || ""}</div>
        ${item.price ? `<div class="card-price">${item.price}₸</div>` : ""}
        <button class="btn-secondary" onclick="window.open('https://t.me/${item.contact.replace('@','')}', '_blank')">
          ${t("contactSellerBtn")}
        </button>
      </div>
    `).join("");
  } catch (e) {
    list.innerHTML = `<p class="hint">${t("errListings")}</p>`;
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
    showToast(t("errFields"));
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
    showToast(t("listingSent"));
    document.getElementById("listing-form").classList.add("hidden");
  } catch (e) {
    showToast(t("errListing"));
  }
});

// ---------- Init ----------
applyTranslations();
