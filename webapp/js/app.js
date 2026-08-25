const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const API_BASE = window.location.origin + "/api";

const tgUser = tg.initDataUnsafe?.user || {};
const currentUser = {
  tg_id: tgUser.id || 0,
  username: tgUser.username || null,
  full_name: [tgUser.first_name, tgUser.last_name].filter(Boolean).join(" ") || null,
};

// ---------- i18n ----------
const LANGS = ["EN", "RU", "KZ", "TM"];

const BASE_DICT = {
  RU: {
    appName: "StudHub",
    readyQuizzes: "Готовые тесты",
    noQuizFound: "Нет нужного теста?",
    orderCustomBtn: "Заказать индивидуальный тест — 5000₸",
    cfFileLabel: "Загрузить файл с вопросами (если нужно)",
    cfDeadlineLabel: "Дедлайн (дата и время)",
    cfDeadlineHint: "Минимум через 24 часа от текущего момента",
    cfCommentLabel: "Пожелания / инструкции",
    cfCommentPlaceholder: "Например: нужно 90%+ правильных",
    cfSubmit: "Оформить заказ — 5000₸",
    catAll: "Все",
    catGoods: "Товары", catStudy: "Учебное",
    catGoodsSingle: "Товар", catStudySingle: "Учебное",
    fSubcategory: "Тип", fSubcategoryPlaceholder: "Или впишите свой вариант",
    moreFilters: "🔍 Фильтры",
    resetFilters: "Сбросить фильтры",
    fCourse: "Курс", fGroup: "Группа", fFaculty: "Факультет", fDepartment: "Кафедра", fSubject: "Предмет",
    searchPlaceholder: "Начните вводить...",
    noOptionsFound: "Ничего не найдено",
    newListingTitle: "Новое объявление",
    lfTitleLabel: "Название",
    lfTitlePlaceholder: "Например: Учебник по матанализу",
    lfDescLabel: "Описание",
    lfDescPlaceholder: "Состояние, детали...",
    lfPriceLabel: "Цена (₸, необязательно)",
    lfContactLabel: "Контакт",
    lfFileLabel: "Файл/фото (по желанию)",
    lfSubmit: "Отправить на модерацию",
    myOrdersTitle: "Мои заказы",
    myListingsTitle: "Мои объявления",
    navHome: "Главная", navCategories: "Категории", navPost: "Разместить", navOrders: "Заказы", navProfile: "Профиль",
    buyBtn: "Купить",
    contactSellerBtn: "Написать продавцу",
    emptyCatalog: "Каталог пока пуст.",
    emptyListings: "Пока нет объявлений в этой категории.",
    emptyOrders: "У вас пока нет заказов.",
    emptyMyListings: "Вы ещё не разместили объявлений.",
    errCatalog: "Не удалось загрузить каталог. Проверьте соединение.",
    errListings: "Не удалось загрузить объявления.",
    errDeadline: "Дедлайн должен быть минимум через 24 часа",
    errFields: "Заполните название и контакт",
    orderCreated: (id) => `Заказ #${id} создан! Реквизиты для оплаты пришли в чат с ботом.`,
    orderPlaced: (id) => `Заказ #${id} оформлен! Реквизиты для оплаты пришли в чат с ботом.`,
    errOrder: "Ошибка при создании заказа",
    listingSent: "Объявление отправлено на модерацию!",
    errListing: "Ошибка при создании объявления",
    uploading: "Загрузка файла...",
    errUpload: "Не удалось загрузить файл",
    attachPhone: "Привязать номер",
    phoneNotLinked: "Номер не привязан",
    phoneRequestSent: "Откройте окно Telegram и подтвердите — номер привяжется автоматически.",
    phoneUpdated: "Номер обновлён!",
    menuSettings: "Настройки", menuNotifications: "Уведомления", menuFaq: "FAQ", menuSupport: "Поддержка",
    comingSoon: "Раздел в разработке — скоро будет доступен",
    orderType_ready_quiz: "Готовый тест",
    orderType_custom_quiz: "Индивидуальный тест",
    status_awaiting_payment: "Ждёт оплаты",
    status_payment_review: "Чек на проверке",
    status_in_progress: "В работе",
    status_done: "Готово",
    status_sent: "Отправлено",
    status_rejected: "Отклонено",
    status_cancelled: "Отменён",
    status_pending: "На модерации",
    status_approved: "Опубликовано",
    status_sold: "Продано",
    cardSubject: "Предмет", cardCourse: "Курс", cardFaculty: "Факультет", cardDepartment: "Кафедра",
    cancelBtn: (min) => `Отменить (осталось ${min} мин)`,
    cancelConfirm: "Отменить этот заказ?",
    cancelSuccess: "Заказ отменён",
    cancelError: "Не удалось отменить заказ — время истекло",
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
    cfFileLabel: "Сұрақтары бар файлды жүктеу (керек болса)",
    cfDeadlineLabel: "Мерзімі (күні мен уақыты)",
    cfDeadlineHint: "Қазіргі уақыттан кемінде 24 сағат кейін",
    cfCommentLabel: "Тілектер / нұсқаулар",
    cfCommentPlaceholder: "Мысалы: 90%+ дұрыс керек",
    cfSubmit: "Тапсырыс беру — 5000₸",
    catAll: "Барлығы",
    catGoods: "Тауарлар", catStudy: "Оқу",
    catGoodsSingle: "Тауар", catStudySingle: "Оқу",
    fSubcategory: "Түрі", fSubcategoryPlaceholder: "Немесе өз нұсқаңызды жазыңыз",
    moreFilters: "🔍 Сүзгілер",
    resetFilters: "Сүзгілерді тазалау",
    fCourse: "Курс", fGroup: "Топ", fFaculty: "Факультет", fDepartment: "Кафедра", fSubject: "Пән",
    searchPlaceholder: "Теруді бастаңыз...",
    noOptionsFound: "Ештеңе табылмады",
    newListingTitle: "Жаңа хабарландыру",
    lfTitleLabel: "Атауы",
    lfTitlePlaceholder: "Мысалы: Матанализ оқулығы",
    lfDescLabel: "Сипаттама",
    lfDescPlaceholder: "Жағдайы, толығырақ...",
    lfPriceLabel: "Бағасы (₸, міндетті емес)",
    lfContactLabel: "Байланыс",
    lfFileLabel: "Файл/фото (қаласаңыз)",
    lfSubmit: "Модерацияға жіберу",
    myOrdersTitle: "Менің тапсырыстарым",
    myListingsTitle: "Менің хабарландыруларым",
    navHome: "Басты бет", navCategories: "Санаттар", navPost: "Орналастыру", navOrders: "Тапсырыстар", navProfile: "Профиль",
    buyBtn: "Сатып алу",
    contactSellerBtn: "Сатушыға жазу",
    emptyCatalog: "Каталог әзірге бос.",
    emptyListings: "Бұл санатта хабарландырулар жоқ.",
    emptyOrders: "Сізде әлі тапсырыстар жоқ.",
    emptyMyListings: "Сіз әлі хабарландыру бермедіңіз.",
    errCatalog: "Каталогты жүктеу мүмкін болмады. Байланысты тексеріңіз.",
    errListings: "Хабарландыруларды жүктеу мүмкін болмады.",
    errDeadline: "Мерзім қазіргі уақыттан кемінде 24 сағат кейін болуы керек",
    errFields: "Атауы мен байланысты толтырыңыз",
    orderCreated: (id) => `#${id} тапсырысы құрылды! Төлем деректемелері ботпен чатқа келді.`,
    orderPlaced: (id) => `#${id} тапсырысы рәсімделді! Төлем деректемелері ботпен чатқа келді.`,
    errOrder: "Тапсырысты құру кезінде қате шықты",
    listingSent: "Хабарландыру модерацияға жіберілді!",
    errListing: "Хабарландыруды құру кезінде қате шықты",
    uploading: "Файл жүктелуде...",
    errUpload: "Файлды жүктеу мүмкін болмады",
    attachPhone: "Нөмірді байланыстыру",
    phoneNotLinked: "Нөмір байланыстырылмаған",
    phoneRequestSent: "Telegram терезесін ашып, растаңыз — нөмір автоматты түрде байланысады.",
    phoneUpdated: "Нөмір жаңартылды!",
    menuSettings: "Баптаулар", menuNotifications: "Хабарламалар", menuFaq: "Жиі қойылатын сұрақтар", menuSupport: "Қолдау қызметі",
    comingSoon: "Бөлім әзірленуде — жақында қолжетімді болады",
    orderType_ready_quiz: "Дайын тест",
    orderType_custom_quiz: "Жеке тест",
    status_awaiting_payment: "Төлемді күтуде",
    status_payment_review: "Чек тексерілуде",
    status_in_progress: "Жұмыста",
    status_done: "Дайын",
    status_sent: "Жіберілді",
    status_rejected: "Қабылданбады",
    status_cancelled: "Бас тартылды",
    status_pending: "Модерацияда",
    status_approved: "Жарияланды",
    status_sold: "Сатылды",
    cardSubject: "Пән", cardCourse: "Курс", cardFaculty: "Факультет", cardDepartment: "Кафедра",
    cancelBtn: (min) => `Бас тарту (${min} мин қалды)`,
    cancelConfirm: "Осы тапсырысты бас тартасыз ба?",
    cancelSuccess: "Тапсырыс бас тартылды",
    cancelError: "Бас тарту мүмкін болмады — уақыт аяқталды",
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
    cfFileLabel: "Upload a file with questions (if needed)",
    cfDeadlineLabel: "Deadline (date and time)",
    cfDeadlineHint: "At least 24 hours from now",
    cfCommentLabel: "Notes / instructions",
    cfCommentPlaceholder: "E.g.: need 90%+ correct",
    cfSubmit: "Place order — 5000₸",
    catAll: "All",
    catGoods: "Goods", catStudy: "Study",
    catGoodsSingle: "Item", catStudySingle: "Study",
    fSubcategory: "Type", fSubcategoryPlaceholder: "Or type your own",
    moreFilters: "🔍 Filters",
    resetFilters: "Reset filters",
    fCourse: "Course", fGroup: "Group", fFaculty: "Faculty", fDepartment: "Department", fSubject: "Subject",
    searchPlaceholder: "Start typing...",
    noOptionsFound: "Nothing found",
    newListingTitle: "New listing",
    lfTitleLabel: "Title",
    lfTitlePlaceholder: "E.g.: Calculus textbook",
    lfDescLabel: "Description",
    lfDescPlaceholder: "Condition, details...",
    lfPriceLabel: "Price (₸, optional)",
    lfContactLabel: "Contact",
    lfFileLabel: "File/photo (optional)",
    lfSubmit: "Send for moderation",
    myOrdersTitle: "My orders",
    myListingsTitle: "My listings",
    navHome: "Home", navCategories: "Categories", navPost: "Post", navOrders: "Orders", navProfile: "Profile",
    buyBtn: "Buy",
    contactSellerBtn: "Message seller",
    emptyCatalog: "Catalog is empty right now.",
    emptyListings: "No listings in this category yet.",
    emptyOrders: "You don't have any orders yet.",
    emptyMyListings: "You haven't posted any listings yet.",
    errCatalog: "Couldn't load the catalog. Check your connection.",
    errListings: "Couldn't load listings.",
    errDeadline: "Deadline must be at least 24 hours from now",
    errFields: "Fill in the title and contact",
    orderCreated: (id) => `Order #${id} created! Payment details sent to the bot chat.`,
    orderPlaced: (id) => `Order #${id} placed! Payment details sent to the bot chat.`,
    errOrder: "Error creating the order",
    listingSent: "Listing sent for moderation!",
    errListing: "Error creating the listing",
    uploading: "Uploading file...",
    errUpload: "Couldn't upload the file",
    attachPhone: "Link phone number",
    phoneNotLinked: "Phone not linked",
    phoneRequestSent: "Open the Telegram prompt and confirm — your number will be linked automatically.",
    phoneUpdated: "Phone updated!",
    menuSettings: "Settings", menuNotifications: "Notifications", menuFaq: "FAQ", menuSupport: "Support",
    comingSoon: "This section is coming soon",
    orderType_ready_quiz: "Ready-made quiz",
    orderType_custom_quiz: "Custom quiz",
    status_awaiting_payment: "Awaiting payment",
    status_payment_review: "Receipt under review",
    status_in_progress: "In progress",
    status_done: "Done",
    status_sent: "Sent",
    status_rejected: "Rejected",
    status_cancelled: "Cancelled",
    status_pending: "Pending review",
    status_approved: "Published",
    status_sold: "Sold",
    cardSubject: "Subject", cardCourse: "Course", cardFaculty: "Faculty", cardDepartment: "Department",
    cancelBtn: (min) => `Cancel (${min} min left)`,
    cancelConfirm: "Cancel this order?",
    cancelSuccess: "Order cancelled",
    cancelError: "Couldn't cancel — the window has expired",
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
    cfFileLabel: "Soraglar bilen faýly ýükläň (gerek bolsa)",
    cfDeadlineLabel: "Möhlet (sene we wagt)",
    cfDeadlineHint: "Häzirki wagtdan iň azyndan 24 sagat soň",
    cfCommentLabel: "Islegler / görkezmeler",
    cfCommentPlaceholder: "Mysal üçin: 90%+ dogry gerek",
    cfSubmit: "Sargyt bermek — 5000₸",
    catAll: "Ählisi",
    catGoods: "Harytlar", catStudy: "Okuw",
    catGoodsSingle: "Harydy", catStudySingle: "Okuw",
    fSubcategory: "Görnüşi", fSubcategoryPlaceholder: "Ýa-da öz wariantyňyzy ýazyň",
    moreFilters: "🔍 Filtrler",
    resetFilters: "Filtrleri arassalamak",
    fCourse: "Kurs", fGroup: "Topar", fFaculty: "Fakultet", fDepartment: "Kafedra", fSubject: "Dersi",
    searchPlaceholder: "Ýazyp başlaň...",
    noOptionsFound: "Hiç zat tapylmady",
    newListingTitle: "Täze bildiriş",
    lfTitleLabel: "Ady",
    lfTitlePlaceholder: "Mysal üçin: Matanaliz kitaby",
    lfDescLabel: "Beýany",
    lfDescPlaceholder: "Ýagdaýy, jikme-jiklikler...",
    lfPriceLabel: "Bahasy (₸, hökman däl)",
    lfContactLabel: "Habarlaşmak",
    lfFileLabel: "Faýl/surat (islege görä)",
    lfSubmit: "Barlaga ibermek",
    myOrdersTitle: "Meniň sargytlarym",
    myListingsTitle: "Meniň bildirişlerim",
    navHome: "Baş sahypa", navCategories: "Kategoriýalar", navPost: "Ýerleşdirmek", navOrders: "Sargytlar", navProfile: "Profil",
    buyBtn: "Satyn almak",
    contactSellerBtn: "Satyja ýazmak",
    emptyCatalog: "Katalog häzirlikçe boş.",
    emptyListings: "Bu kategoriýada bildirişler ýok.",
    emptyOrders: "Sizde entek sargyt ýok.",
    emptyMyListings: "Siz entek bildiriş ýerleşdirmediňiz.",
    errCatalog: "Katalogy ýüklemek başartmady. Baglanyşygy barlaň.",
    errListings: "Bildirişleri ýüklemek başartmady.",
    errDeadline: "Möhlet häzirki wagtdan iň azyndan 24 sagat soň bolmaly",
    errFields: "Ady we habarlaşmagy dolduryň",
    orderCreated: (id) => `#${id} sargydy döredildi! Töleg maglumatlary bot çatyna geldi.`,
    orderPlaced: (id) => `#${id} sargydy resmileşdirildi! Töleg maglumatlary bot çatyna geldi.`,
    errOrder: "Sargyt döredilende ýalňyşlyk ýüze çykdy",
    listingSent: "Bildiriş barlaga iberildi!",
    errListing: "Bildiriş döredilende ýalňyşlyk ýüze çykdy",
    uploading: "Faýl ýüklenýär...",
    errUpload: "Faýly ýüklemek başartmady",
    attachPhone: "Belgini baglamak",
    phoneNotLinked: "Belgi baglanmadyk",
    phoneRequestSent: "Telegram penjiresini açyň we tassyklaň — belgi awtomatiki baglanar.",
    phoneUpdated: "Belgi täzelendi!",
    menuSettings: "Sazlamalar", menuNotifications: "Bildirişler", menuFaq: "Ýygy-ýygydan soralýan soraglar", menuSupport: "Goldaw",
    comingSoon: "Bölüm ýakynda elýeterli bolar",
    orderType_ready_quiz: "Taýýar test",
    orderType_custom_quiz: "Şahsy test",
    status_awaiting_payment: "Töleg garaşylýar",
    status_payment_review: "Çek barlanýar",
    status_in_progress: "Işlenýär",
    status_done: "Taýýar",
    status_sent: "Iberildi",
    status_rejected: "Ret edildi",
    status_cancelled: "Ýatyryldy",
    status_pending: "Barlagda",
    status_approved: "Çap edildi",
    status_sold: "Satyldy",
    cardSubject: "Dersi", cardCourse: "Kurs", cardFaculty: "Fakultet", cardDepartment: "Kafedra",
    cancelBtn: (min) => `Ýatyrmak (${min} min galdy)`,
    cancelConfirm: "Bu sargydy ýatyrmalymy?",
    cancelSuccess: "Sargyt ýatyryldy",
    cancelError: "Ýatyryp bolmady — wagt gutardy",
    banners: [
      { icon: "🎓", text: "Bellenen bahadaky taýýar Quizizz testleri — 3000₸" },
      { icon: "⏱️", text: "Möhlete test gerekmi? Şahsy taýýarlarys — 5000₸" },
    ],
  },
};

const DICT = BASE_DICT;
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
  renderFilterButtonLabels();
  renderSubcategoryChips();
  renderBanner();
  loadCatalog();
  loadListings();
  renderPhoneRow();
}

// ---------- Попап выбора языка ----------
const langSwitchBtn = document.getElementById("lang-switch");
const langOverlay = document.getElementById("lang-overlay");

langSwitchBtn.addEventListener("click", () => langOverlay.classList.toggle("hidden"));
langOverlay.addEventListener("click", (e) => { if (e.target === langOverlay) langOverlay.classList.add("hidden"); });

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

// ---------- Нижнее меню (5 вкладок) ----------
document.querySelectorAll(".nav-item").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("tab-" + btn.dataset.tab).classList.add("active");

    setBannerVisible(btn.dataset.tab === "home");

    if (btn.dataset.tab === "orders") { loadMyOrders(); loadMyListings(); }
    if (btn.dataset.tab === "profile") loadProfile();
  });
});

// ---------- Quizizz: каталог ----------
async function loadCatalog() {
  const list = document.getElementById("catalog-list");
  try {
    const res = await fetch(`${API_BASE}/quiz/catalog`);
    const items = await res.json();
    if (!items.length) { list.innerHTML = `<p class="hint">${t("emptyCatalog")}</p>`; return; }
    list.innerHTML = items.map((item) => `
      <div class="card">
        <div class="card-title">${item.title}</div>
        <div class="card-attrs">
          ${item.subject ? `<div class="card-attr"><b>${t("cardSubject")}:</b> ${item.subject}</div>` : ""}
          ${item.course ? `<div class="card-attr"><b>${t("cardCourse")}:</b> ${item.course}</div>` : ""}
          ${item.faculty ? `<div class="card-attr"><b>${t("cardFaculty")}:</b> ${item.faculty}</div>` : ""}
          ${item.department ? `<div class="card-attr"><b>${t("cardDepartment")}:</b> ${item.department}</div>` : ""}
        </div>
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

const deadlineInput = document.getElementById("cf-deadline");
function refreshDeadlineMin() {
  const min = new Date(Date.now() + 24 * 60 * 60 * 1000);
  min.setSeconds(0, 0);
  deadlineInput.min = min.toISOString().slice(0, 16);
}
refreshDeadlineMin();

let selectedQuestionFile = null;
document.getElementById("cf-file").addEventListener("change", (e) => {
  selectedQuestionFile = e.target.files[0] || null;
  document.getElementById("cf-file-name").textContent = selectedQuestionFile ? selectedQuestionFile.name : "";
});

async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: formData });
  if (!res.ok) throw new Error("upload failed");
  const data = await res.json();
  return data.url ? window.location.origin + data.url : null;
}

document.getElementById("cf-submit").addEventListener("click", async () => {
  const deadline = deadlineInput.value;
  const comment = document.getElementById("cf-comment").value.trim();

  if (!deadline || new Date(deadline) < new Date(Date.now() + 24 * 60 * 60 * 1000 - 60000)) {
    showToast(t("errDeadline"));
    return;
  }

  let fileUrl = null;
  try {
    if (selectedQuestionFile) {
      showToast(t("uploading"));
      fileUrl = await uploadFile(selectedQuestionFile);
    }
  } catch (e) {
    showToast(t("errUpload"));
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/quiz/order/custom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...currentUser,
        questions_file_url: fileUrl,
        deadline: new Date(deadline).toISOString(),
        comment: comment || null,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      showToast(err?.detail?.[0]?.msg || t("errOrder"));
      return;
    }
    const order = await res.json();
    showToast(t("orderPlaced")(order.id));
    tg.close();
  } catch (e) {
    showToast(t("errOrder"));
  }
});

// ---------- Категории: пилюли + фильтры с автокомплитом ----------
let selectedCategory = "";
const filters = { subcategory: "", course: "", group_name: "", faculty: "", department: "", subject: "" };

const ACADEMIC_FIELDS = ["course", "group_name", "faculty", "department", "subject"];

document.querySelectorAll("#cat-row .cat-pill[data-category]").forEach((pill) => {
  pill.addEventListener("click", () => {
    document.querySelectorAll("#cat-row .cat-pill[data-category]").forEach((b) => b.classList.remove("active"));
    pill.classList.add("active");
    selectedCategory = pill.dataset.category;
    updateAcademicFieldsVisibility();
    renderSubcategoryChips();
    loadListings();
  });
});

function updateAcademicFieldsVisibility() {
  const show = selectedCategory !== "goods";
  ACADEMIC_FIELDS.forEach((field) => {
    const btn = document.querySelector(`.filter-field-btn[data-field="${field}"]`);
    if (btn) btn.classList.toggle("hidden", !show);
  });
}

document.getElementById("btn-toggle-filters").addEventListener("click", () => {
  document.getElementById("extra-filters").classList.toggle("hidden");
});

function renderFilterButtonLabels() {
  document.querySelectorAll(".filter-field-btn").forEach((btn) => {
    const field = btn.dataset.field;
    const value = filters[field];
    const label = t(btn.dataset.i18n) || field;
    btn.textContent = value ? `${label}: ${value}` : label;
    btn.classList.toggle("has-value", !!value);
  });
}

document.getElementById("btn-reset-filters").addEventListener("click", () => {
  Object.keys(filters).forEach((k) => (filters[k] = ""));
  renderFilterButtonLabels();
  renderSubcategoryChips();
  loadListings();
});

// ---------- Чипы примеров подкатегорий ----------
async function renderSubcategoryChips() {
  const container = document.getElementById("subcategory-chips");
  const options = await runSearch("subcategory", "");
  container.innerHTML = options.map((opt) => `
    <button class="chip ${filters.subcategory === opt ? "active" : ""}" data-value="${opt}">${opt}</button>
  `).join("");
  container.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      filters.subcategory = filters.subcategory === chip.dataset.value ? "" : chip.dataset.value;
      renderFilterButtonLabels();
      renderSubcategoryChips();
      loadListings();
    });
  });
}

// ---------- Попап автокомплита ----------
const searchOverlay = document.getElementById("search-overlay");
const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");
let activeSearchField = null;
let searchDebounce = null;

async function runSearch(field, query) {
  try {
    const params = new URLSearchParams({ q: query });
    if (selectedCategory) params.set("category", selectedCategory);
    const res = await fetch(`${API_BASE}/marketplace/filter-options/${field}?${params.toString()}`);
    const data = await res.json();
    return data.options || [];
  } catch (e) {
    return [];
  }
}

function renderSearchResults(options) {
  if (!options.length) {
    searchResults.innerHTML = `<div class="search-result-empty">${t("noOptionsFound")}</div>`;
    return;
  }
  searchResults.innerHTML = options.map((opt) => `
    <button class="search-result-item" data-value="${opt}">${opt}</button>
  `).join("");
  searchResults.querySelectorAll(".search-result-item").forEach((el) => {
    el.addEventListener("click", () => {
      filters[activeSearchField] = el.dataset.value;
      renderFilterButtonLabels();
      if (activeSearchField === "subcategory") renderSubcategoryChips();
      searchOverlay.classList.add("hidden");
      loadListings();
    });
  });
}

document.querySelectorAll(".filter-field-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    activeSearchField = btn.dataset.field;
    searchInput.value = "";
    searchOverlay.classList.remove("hidden");
    searchInput.focus();
    renderSearchResults(await runSearch(activeSearchField, ""));
  });
});

searchInput.addEventListener("input", () => {
  clearTimeout(searchDebounce);
  const query = searchInput.value.trim();
  searchDebounce = setTimeout(async () => {
    renderSearchResults(await runSearch(activeSearchField, query));
  }, 250);
});

searchOverlay.addEventListener("click", (e) => {
  if (e.target === searchOverlay) searchOverlay.classList.add("hidden");
});

// ---------- Маркетплейс: лента ----------
async function loadListings() {
  const list = document.getElementById("market-list");
  const params = new URLSearchParams();
  if (selectedCategory) params.set("category", selectedCategory);
  Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
  const qs = params.toString();

  try {
    const res = await fetch(`${API_BASE}/marketplace/listings${qs ? "?" + qs : ""}`);
    const items = await res.json();
    if (!items.length) { list.innerHTML = `<p class="hint">${t("emptyListings")}</p>`; return; }
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

// ---------- Разместить: категория → показать форму, автоподстановка контакта ----------
let postCategory = null;
let selectedListingFile = null;
let postSelectedSubcategory = "";

async function renderPostSubcategoryChips() {
  const container = document.getElementById("post-subcategory-chips");
  const options = await runSearch("subcategory", "");
  container.innerHTML = options.map((opt) => `
    <button type="button" class="chip ${postSelectedSubcategory === opt ? "active" : ""}" data-value="${opt}">${opt}</button>
  `).join("");
  container.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      postSelectedSubcategory = postSelectedSubcategory === chip.dataset.value ? "" : chip.dataset.value;
      document.getElementById("lf-subcategory").value = postSelectedSubcategory;
      renderPostSubcategoryChips();
    });
  });
}

document.querySelectorAll("#post-cat-tiles .cat-tile").forEach((tile) => {
  tile.addEventListener("click", async () => {
    document.querySelectorAll("#post-cat-tiles .cat-tile").forEach((b) => b.classList.remove("active"));
    tile.classList.add("active");
    postCategory = tile.dataset.category;
    document.getElementById("post-form").classList.remove("hidden");
    document.getElementById("post-academic-fields").classList.toggle("hidden", postCategory === "goods");

    postSelectedSubcategory = "";
    document.getElementById("lf-subcategory").value = "";
    // временно используем postCategory как контекст поиска примеров подкатегорий
    const prevSelected = selectedCategory;
    selectedCategory = postCategory;
    await renderPostSubcategoryChips();
    selectedCategory = prevSelected;

    const contactField = document.getElementById("lf-contact");
    if (!contactField.value && currentUser.username) {
      contactField.value = "@" + currentUser.username;
    }
  });
});

document.getElementById("lf-file").addEventListener("change", (e) => {
  selectedListingFile = e.target.files[0] || null;
  document.getElementById("lf-file-name").textContent = selectedListingFile ? selectedListingFile.name : "";
});

document.getElementById("lf-submit").addEventListener("click", async () => {
  if (!postCategory) return;

  const subcategory = document.getElementById("lf-subcategory").value.trim();
  const title = document.getElementById("lf-title").value.trim();
  const description = document.getElementById("lf-description").value.trim();
  const price = document.getElementById("lf-price").value;
  const contact = document.getElementById("lf-contact").value.trim();
  const course = document.getElementById("lf-course").value.trim();
  const group_name = document.getElementById("lf-group").value.trim();
  const faculty = document.getElementById("lf-faculty").value.trim();
  const department = document.getElementById("lf-department").value.trim();
  const subject = document.getElementById("lf-subject").value.trim();

  if (!title || !contact) { showToast(t("errFields")); return; }

  let attachmentUrl = null;
  try {
    if (selectedListingFile) {
      showToast(t("uploading"));
      attachmentUrl = await uploadFile(selectedListingFile);
    }
  } catch (e) {
    showToast(t("errUpload"));
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/marketplace/listings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...currentUser,
        category: postCategory, title,
        subcategory: subcategory || null,
        description: description || null,
        price: price ? parseInt(price, 10) : null,
        contact,
        attachment_url: attachmentUrl,
        course: course || null,
        group_name: group_name || null,
        faculty: faculty || null,
        department: department || null,
        subject: subject || null,
      }),
    });
    if (!res.ok) throw new Error();
    showToast(t("listingSent"));
    ["lf-title", "lf-description", "lf-price", "lf-subcategory", "lf-course", "lf-group", "lf-faculty", "lf-department", "lf-subject"]
      .forEach((id) => { document.getElementById(id).value = ""; });
    postSelectedSubcategory = "";
    renderPostSubcategoryChips();
    selectedListingFile = null;
    document.getElementById("lf-file-name").textContent = "";
    document.getElementById("lf-file").value = "";
  } catch (e) {
    showToast(t("errListing"));
  }
});

// ---------- Заказы / Объявления: сегмент-переключатель ----------
document.querySelectorAll("#orders-segmented .segmented-item").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#orders-segmented .segmented-item").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".segment-content").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("segment-" + btn.dataset.segment).classList.add("active");
  });
});

function renderOrderAttrs(o) {
  const rows = [];
  if (o.subject) rows.push(`<div class="card-attr"><b>${t("cardSubject")}:</b> ${o.subject}</div>`);
  if (o.course) rows.push(`<div class="card-attr"><b>${t("cardCourse")}:</b> ${o.course}</div>`);
  if (o.faculty) rows.push(`<div class="card-attr"><b>${t("cardFaculty")}:</b> ${o.faculty}</div>`);
  if (o.department) rows.push(`<div class="card-attr"><b>${t("cardDepartment")}:</b> ${o.department}</div>`);
  return rows.join("");
}

async function loadMyOrders() {
  const list = document.getElementById("orders-list");
  if (!currentUser.tg_id) { list.innerHTML = `<p class="hint">${t("emptyOrders")}</p>`; return; }
  try {
    const res = await fetch(`${API_BASE}/users/${currentUser.tg_id}/orders`);
    const items = await res.json();
    if (!items.length) { list.innerHTML = `<p class="hint">${t("emptyOrders")}</p>`; return; }
    list.innerHTML = items.map((o) => `
      <div class="card" data-order-id="${o.id}">
        <div class="card-title">#${o.id} · ${o.title || t("orderType_" + o.order_type)}</div>
        <div class="card-attrs">${renderOrderAttrs(o)}</div>
        <div class="card-price">${o.price}₸</div>
        <div class="card-footer-row">
          <span class="status-badge">${t("status_" + o.status)}</span>
          ${o.can_cancel ? `<button class="btn-cancel" onclick="cancelOrder(${o.id})">${t("cancelBtn")(Math.ceil(o.cancel_seconds_left / 60))}</button>` : ""}
        </div>
      </div>
    `).join("");
  } catch (e) {
    list.innerHTML = `<p class="hint">${t("errListings")}</p>`;
  }
}

async function cancelOrder(orderId) {
  if (!confirm(t("cancelConfirm"))) return;
  try {
    const res = await fetch(`${API_BASE}/quiz/order/${orderId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tg_id: currentUser.tg_id }),
    });
    if (!res.ok) throw new Error();
    showToast(t("cancelSuccess"));
    loadMyOrders();
  } catch (e) {
    showToast(t("cancelError"));
  }
}

async function loadMyListings() {
  const list = document.getElementById("my-listings-list");
  if (!currentUser.tg_id) { list.innerHTML = `<p class="hint">${t("emptyMyListings")}</p>`; return; }
  try {
    const res = await fetch(`${API_BASE}/users/${currentUser.tg_id}/listings`);
    const items = await res.json();
    if (!items.length) { list.innerHTML = `<p class="hint">${t("emptyMyListings")}</p>`; return; }
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

async function fetchProfile() {
  const res = await fetch(`${API_BASE}/users/profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(currentUser),
  });
  return res.json();
}

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
    profileData = await fetchProfile();
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

document.getElementById("btn-refresh-profile").addEventListener("click", async () => {
  try {
    profileData = await fetchProfile();
    renderPhoneRow();
    showToast(t("phoneUpdated"));
  } catch (e) { /* тихо игнорируем */ }
});

document.getElementById("btn-attach-phone").addEventListener("click", () => {
  const poll = () => {
    let attempts = 0;
    const timer = setInterval(async () => {
      attempts += 1;
      try {
        const fresh = await fetchProfile();
        if (fresh.phone) {
          profileData = fresh;
          renderPhoneRow();
          showToast(t("phoneUpdated"));
          clearInterval(timer);
        }
      } catch (e) { /* игнор, попробуем ещё раз */ }
      if (attempts >= 6) clearInterval(timer);
    }, 1500);
  };

  if (tg.requestContact) {
    tg.requestContact((sent) => {
      if (sent) {
        showToast(t("phoneRequestSent"));
        poll();
      }
    });
  } else {
    showToast(t("phoneRequestSent"));
  }
});

["menu-settings", "menu-notifications", "menu-faq", "menu-support"].forEach((id) => {
  document.getElementById(id).addEventListener("click", () => showToast(t("comingSoon")));
});

// ---------- Init ----------
applyTranslations();
setBannerVisible(true);
