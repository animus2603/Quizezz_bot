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
const LANGS = ["EN", "RU", "KZ", "TM"];

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
    myOrdersTitle: "Мои заказы",
    myListingsTitle: "Мои объявления",
    navHome: "Главная", navCategories: "Категории", navOrders: "Заказы", navProfile: "Профиль",
    buyBtn: "Купить",
    contactSellerBtn: "Написать продавцу",
    emptyCatalog: "Каталог пока пуст.",
    emptyListings: "Пока нет объявлений в этой категории.",
    emptyOrders: "У вас пока нет заказов.",
    emptyMyListings: "Вы ещё не разместили объявлений.",
    errCatalog: "Не удалось загрузить каталог. Проверьте соединение.",
    errListings: "Не удалось загрузить объявления.",
    errDeadline: "Укажите дедлайн",
    errFields: "Заполните название и контакт",
    orderCreated: (id) => `Заказ #${id} создан! Вернитесь в чат с ботом — там реквизиты для оплаты.`,
    orderPlaced: (id) => `Заказ #${id} оформлен! Вернитесь в чат с ботом для оплаты.`,
    errOrder: "Ошибка при создании заказа",
    listingSent: "Объявление отправлено на модерацию!",
    errListing: "Ошибка при создании объявления",
    attachPhone: "Привязать номер",
    phoneNotLinked: "Номер не привязан",
    phoneRequestSent: "Откройте всплывающее окно Telegram и подтвердите — номер привяжется автоматически.",
    menuSettings: "Настройки",
    menuNotifications: "Уведомления",
    menuFaq: "FAQ",
    menuSupport: "Поддержка",
    comingSoon: "Раздел в разработке — скоро будет доступен",
    orderType_ready_quiz: "Готовый тест",
    orderType_custom_quiz: "Индивидуальный тест",
    status_awaiting_payment: "Ждёт оплаты",
    status_payment_review: "Чек на проверке",
    status_in_progress: "В работе",
    status_done: "Готово",
    status_sent: "Отправлено",
    status_rejected: "Отклонено",
    status_pending: "На модерации",
    status_approved: "Опубликовано",
    status_sold: "Продано",
    banners: [
      { icon: "🎓", text: "Готовые тесты Quizizz по фиксированной цене — 3000₸" },
      { icon: "⏱️", text: "Нужен тест к дедлайну? Закажем индивидуально — 5000₸" },
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
    myOrdersTitle: "Менің тапсырыстарым",
    myListingsTitle: "Менің хабарландыруларым",
    navHome: "Басты бет", navCategories: "Санаттар", navOrders: "Тапсырыстар", navProfile: "Профиль",
    buyBtn: "Сатып алу",
    contactSellerBtn: "Сатушыға жазу",
    emptyCatalog: "Каталог әзірге бос.",
    emptyListings: "Бұл санатта хабарландырулар жоқ.",
    emptyOrders: "Сізде әлі тапсырыстар жоқ.",
    emptyMyListings: "Сіз әлі хабарландыру бермедіңіз.",
    errCatalog: "Каталогты жүктеу мүмкін болмады. Байланысты тексеріңіз.",
    errListings: "Хабарландыруларды жүктеу мүмкін болмады.",
    errDeadline: "Мерзімді көрсетіңіз",
    errFields: "Атауы мен байланысты толтырыңыз",
    orderCreated: (id) => `#${id} тапсырысы құрылды! Ботпен чатқа қайтыңыз — онда төлем деректемелері бар.`,
    orderPlaced: (id) => `#${id} тапсырысы рәсімделді! Төлеу үшін ботпен чатқа қайтыңыз.`,
    errOrder: "Тапсырысты құру кезінде қате шықты",
    listingSent: "Хабарландыру модерацияға жіберілді!",
    errListing: "Хабарландыруды құру кезінде қате шықты",
    attachPhone: "Нөмірді байланыстыру",
    phoneNotLinked: "Нөмір байланыстырылмаған",
    phoneRequestSent: "Telegram терезесін ашып, растаңыз — нөмір автоматты түрде байланысады.",
    menuSettings: "Баптаулар",
    menuNotifications: "Хабарламалар",
    menuFaq: "Жиі қойылатын сұрақтар",
    menuSupport: "Қолдау қызметі",
    comingSoon: "Бөлім әзірленуде — жақында қолжетімді болады",
    orderType_ready_quiz: "Дайын тест",
    orderType_custom_quiz: "Жеке тест",
    status_awaiting_payment: "Төлемді күтуде",
    status_payment_review: "Чек тексерілуде",
    status_in_progress: "Жұмыста",
    status_done: "Дайын",
    status_sent: "Жіберілді",
    status_rejected: "Қабылданбады",
    status_pending: "Модерацияда",
    status_approved: "Жарияланды",
    status_sold: "Сатылды",
    banners: [
      { icon: "🎓", text: "Дайын Quizizz тесттері бекітілген бағамен — 3000₸" },
      { icon: "⏱️", text: "Мерзімге тест керек пе? Жеке тапсырыс береміз — 5000₸" },
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
    myOrdersTitle: "My orders",
    myListingsTitle: "My listings",
    navHome: "Home", navCategories: "Categories", navOrders: "Orders", navProfile: "Profile",
    buyBtn: "Buy",
    contactSellerBtn: "Message seller",
    emptyCatalog: "Catalog is empty right now.",
    emptyListings: "No listings in this category yet.",
    emptyOrders: "You don't have any orders yet.",
    emptyMyListings: "You haven't posted any listings yet.",
    errCatalog: "Couldn't load the catalog. Check your connection.",
    errListings: "Couldn't load listings.",
    errDeadline: "Please set a deadline",
    errFields: "Fill in the title and contact",
    orderCreated: (id) => `Order #${id} created! Go back to the bot chat for payment details.`,
    orderPlaced: (id) => `Order #${id} placed! Go back to the bot chat to pay.`,
    errOrder: "Error creating the order",
    listingSent: "Listing sent for moderation!",
    errListing: "Error creating the listing",
    attachPhone: "Link phone number",
    phoneNotLinked: "Phone not linked",
    phoneRequestSent: "Open the Telegram prompt and confirm — your number will be linked automatically.",
    menuSettings: "Settings",
    menuNotifications: "Notifications",
    menuFaq: "FAQ",
    menuSupport: "Support",
    comingSoon: "This section is coming soon",
    orderType_ready_quiz: "Ready-made quiz",
    orderType_custom_quiz: "Custom quiz",
    status_awaiting_payment: "Awaiting payment",
    status_payment_review: "Receipt under review",
    status_in_progress: "In progress",
    status_done: "Done",
    status_sent: "Sent",
    status_rejected: "Rejected",
    status_pending: "Pending review",
    status_approved: "Published",
    status_sold: "Sold",
    banners: [
      { icon: "🎓", text: "Ready-made Quizizz tests at a fixed price — 3000₸" },
      { icon: "⏱️", text: "Need a quiz by a deadline? We'll do it custom — 5000₸" },
    ],
  },
  TM: {
    appName: "StudHub",
    readyQuizzes: "Taýýar testler",
    noQuizFound: "Gerekli testiňiz ýokmy?",
    orderCustomBtn: "Şahsy test sargyt et — 5000₸",
    cfFileLabel: "Test soraglarynyň salgysy/beýany",
    cfFilePlaceholder: "Faýla salgy ýa-da Quizizz",
    cfDeadlineLabel: "Möhlet (sene we wagt)",
    cfCommentLabel: "Islegler / görkezmeler",
    cfCommentPlaceholder: "Mysal üçin: 90%+ dogry gerek",
    cfSubmit: "Sargyt bermek — 5000₸",
    catAll: "Ähli kategoriýalar",
    catGoods: "Harytlar", catServices: "Hyzmatlar", catAds: "Mahabat",
    catGoodsSingle: "Harydy", catServicesSingle: "Hyzmat", catAdsSingle: "Mahabat",
    newListingBtn: "+ Ýerleşdirmek",
    lfCategoryLabel: "Kategoriýa",
    lfTitleLabel: "Ady",
    lfTitlePlaceholder: "Mysal üçin: Matanaliz kitaby",
    lfDescLabel: "Beýany",
    lfDescPlaceholder: "Ýagdaýy, jikme-jiklikler...",
    lfPriceLabel: "Bahasy (₸, hökman däl)",
    lfContactLabel: "Habarlaşmak (@username)",
    lfSubmit: "Barlaga ibermek",
    myOrdersTitle: "Meniň sargytlarym",
    myListingsTitle: "Meniň bildirişlerim",
    navHome: "Baş sahypa", navCategories: "Kategoriýalar", navOrders: "Sargytlar", navProfile: "Profil",
    buyBtn: "Satyn almak",
    contactSellerBtn: "Satyja ýazmak",
    emptyCatalog: "Katalog häzirlikçe boş.",
    emptyListings: "Bu kategoriýada bildirişler ýok.",
    emptyOrders: "Sizde entek sargyt ýok.",
    emptyMyListings: "Siz entek bildiriş ýerleşdirmediňiz.",
    errCatalog: "Katalogy ýüklemek başartmady. Baglanyşygy barlaň.",
    errListings: "Bildirişleri ýüklemek başartmady.",
    errDeadline: "Möhleti görkeziň",
    errFields: "Ady we habarlaşmagy dolduryň",
    orderCreated: (id) => `#${id} sargydy döredildi! Bot bilen çata dolanyň — töleg maglumatlary şol ýerde.`,
    orderPlaced: (id) => `#${id} sargydy resmileşdirildi! Tölemek üçin bot bilen çata dolanyň.`,
    errOrder: "Sargyt döredilende ýalňyşlyk ýüze çykdy",
    listingSent: "Bildiriş barlaga iberildi!",
    errListing: "Bildiriş döredilende ýalňyşlyk ýüze çykdy",
    attachPhone: "Belgini baglamak",
    phoneNotLinked: "Belgi baglanmadyk",
    phoneRequestSent: "Telegram penjiresini açyň we tassyklaň — belgi awtomatiki baglanar.",
    menuSettings: "Sazlamalar",
    menuNotifications: "Bildirişler",
    menuFaq: "Ýygy-ýygydan soralýan soraglar",
    menuSupport: "Goldaw",
    comingSoon: "Bölüm ýakynda elýeterli bolar",
    orderType_ready_quiz: "Taýýar test",
    orderType_custom_quiz: "Şahsy test",
    status_awaiting_payment: "Töleg garaşylýar",
    status_payment_review: "Çek barlanýar",
    status_in_progress: "Işlenýär",
    status_done: "Taýýar",
    status_sent: "Iberildi",
    status_rejected: "Ret edildi",
    status_pending: "Barlagda",
    status_approved: "Çap edildi",
    status_sold: "Satyldy",
    banners: [
      { icon: "🎓", text: "Bellenen bahadaky taýýar Quizizz testleri — 3000₸" },
      { icon: "⏱️", text: "Möhlete test gerekmi? Şahsy taýýarlarys — 5000₸" },
    ],
  },
};

let currentLang = "RU";

function t(key) {
  return DICT[currentLang][key] ?? DICT.RU[key] ?? key;
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
  document.querySelectorAll(".lang-option").forEach((el) => {
    el.classList.toggle("active", el.dataset.lang === currentLang);
  });
  renderBanner();
  loadCatalog();
  loadListings();
  renderPhoneRow();
}

// ---------- Попап выбора языка ----------
const langSwitchBtn = document.getElementById("lang-switch");
const langOverlay = document.getElementById("lang-overlay");

langSwitchBtn.addEventListener("click", () => {
  langOverlay.classList.toggle("hidden");
});

langOverlay.addEventListener("click", (e) => {
  if (e.target === langOverlay) langOverlay.classList.add("hidden");
});

document.querySelectorAll(".lang-option").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentLang = btn.dataset.lang;
    langOverlay.classList.add("hidden");
    applyTranslations();
  });
});

function showToast(text) {
  const toast = document.getElementById("toast");
  toast.textContent = text;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 3000);
}

// ---------- Баннер-карусель (только на Главной) ----------
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

function setBannerVisible(visible) {
  document.getElementById("banner").classList.toggle("hidden", !visible);
}

// ---------- Нижнее меню (4 вкладки) ----------
document.querySelectorAll(".nav-item").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("tab-" + btn.dataset.tab).classList.add("active");

    setBannerVisible(btn.dataset.tab === "home");

    if (btn.dataset.tab === "orders") {
      loadMyOrders();
      loadMyListings();
    }
    if (btn.dataset.tab === "profile") {
      loadProfile();
    }
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

// ---------- Маркетплейс: лента (вкладка «Категории») ----------
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

// ---------- Вкладка «Заказы» ----------
async function loadMyOrders() {
  const list = document.getElementById("orders-list");
  if (!currentUser.tg_id) {
    list.innerHTML = `<p class="hint">${t("emptyOrders")}</p>`;
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/users/${currentUser.tg_id}/orders`);
    const items = await res.json();
    if (!items.length) {
      list.innerHTML = `<p class="hint">${t("emptyOrders")}</p>`;
      return;
    }
    list.innerHTML = items.map((o) => `
      <div class="card">
        <div class="card-title">#${o.id} · ${t("orderType_" + o.order_type)}</div>
        <div class="card-desc">${o.price}₸</div>
        <span class="status-badge">${t("status_" + o.status)}</span>
      </div>
    `).join("");
  } catch (e) {
    list.innerHTML = `<p class="hint">${t("errListings")}</p>`;
  }
}

async function loadMyListings() {
  const list = document.getElementById("my-listings-list");
  if (!currentUser.tg_id) {
    list.innerHTML = `<p class="hint">${t("emptyMyListings")}</p>`;
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/users/${currentUser.tg_id}/listings`);
    const items = await res.json();
    if (!items.length) {
      list.innerHTML = `<p class="hint">${t("emptyMyListings")}</p>`;
      return;
    }
    list.innerHTML = items.map((l) => `
      <div class="card">
        <div class="card-title">${l.title}</div>
        <div class="card-desc">${l.price ? l.price + "₸" : ""}</div>
        <span class="status-badge">${t("status_" + l.status)}</span>
      </div>
    `).join("");
  } catch (e) {
    list.innerHTML = `<p class="hint">${t("errListings")}</p>`;
  }
}

// ---------- Вкладка «Профиль» ----------
let profileData = null;

async function loadProfile() {
  const avatarImg = document.getElementById("profile-avatar");
  const avatarFallback = document.getElementById("profile-avatar-fallback");
  const nameEl = document.getElementById("profile-name");
  const usernameEl = document.getElementById("profile-username");

  nameEl.textContent = currentUser.full_name || "—";
  usernameEl.textContent = currentUser.username ? "@" + currentUser.username : "—";

  if (tgUser.photo_url) {
    avatarImg.src = tgUser.photo_url;
    avatarImg.style.display = "block";
    avatarFallback.style.display = "none";
  } else {
    avatarImg.style.display = "none";
    avatarFallback.style.display = "flex";
    const initial = (currentUser.full_name || currentUser.username || "?").trim()[0]?.toUpperCase() || "?";
    avatarFallback.textContent = initial;
  }

  try {
    const res = await fetch(`${API_BASE}/users/profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentUser),
    });
    profileData = await res.json();
  } catch (e) {
    profileData = null;
  }

  renderPhoneRow();
}

function renderPhoneRow() {
  const phoneEl = document.getElementById("profile-phone");
  if (!phoneEl) return;
  phoneEl.textContent = profileData?.phone || t("phoneNotLinked");
}

document.getElementById("btn-attach-phone").addEventListener("click", () => {
  if (tg.requestContact) {
    tg.requestContact((sent) => {
      if (sent) showToast(t("phoneRequestSent"));
    });
  } else {
    showToast(t("phoneRequestSent"));
  }
});

// пункты меню профиля — MVP-заглушки
["menu-settings", "menu-notifications", "menu-faq", "menu-support"].forEach((id) => {
  document.getElementById(id).addEventListener("click", () => showToast(t("comingSoon")));
});

// ---------- Init ----------
applyTranslations();
setBannerVisible(true);
