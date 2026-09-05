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
    marketplacePreviewTitle: "Из маркетплейса",
    viewAllBtn: "Смотреть все ›",
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
    contactAutoHint: "Подставляется автоматически из вашего Telegram-профиля",
    fillPreviousField: (label) => `Сначала выберите: ${label}`,
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
    statOrders: "Заказов", statListings: "Объявлений",
    referralTitle: "Пригласи друга",
    referralDesc: "Твой код приглашения — поделись им с друзьями",
    referralInvitedLabel: "Приглашено",
    referralShareBtn: "Поделиться кодом",
    referralShareText: "Заходи в StudHub — тесты и маркетплейс для студентов 🎓",
    referralInputPlaceholder: "Есть код друга? Введите его",
    referralApplyBtn: "Применить",
    referralCopied: "Код скопирован",
    referralApplySuccess: "Код применён!",
    referralApplyError: "Не удалось применить код",
    previewBtn: "Посмотреть", noPreview: "Пример вопросов пока не добавлен.",
    settingsLanguage: "Язык",
    settingsShare: "Поделиться приложением",
    settingsShareDesc: "Расскажи друзьям про StudHub",
    settingsShareText: "Загляни в StudHub — тесты и маркетплейс для студентов 🎓",
    notifOrdersLabel: "Заказы и оплата", notifOrdersDesc: "Статусы заказов, подтверждение оплаты",
    notifMarketLabel: "Маркетплейс", notifMarketDesc: "Модерация объявлений, ответы покупателям",
    notifNewsLabel: "Новости и акции", notifNewsDesc: "Новые функции и специальные предложения",
    faqItems: [
      { q: "Как оплатить заказ?", a: "После оформления заказа бот пришлёт реквизиты Kaspi. Переведите сумму и отправьте боту скриншот чека — оператор подтвердит оплату." },
      { q: "Сколько ждать готовый тест?", a: "Готовые тесты из каталога отправляются сразу после подтверждения оплаты. Индивидуальные заказы выполняются в течение рабочего дня после подтверждения." },
      { q: "Можно ли отменить заказ?", a: "Да, в течение часа после оформления — в разделе «Заказы» рядом с неоплаченным заказом появится кнопка отмены." },
      { q: "Как разместить объявление?", a: "Перейдите в раздел «Разместить», выберите категорию — Учебное или Товары — и заполните форму. Объявление опубликуется после проверки модератором." },
      { q: "Что делать, если номер не привязался?", a: "Откройте раздел «Профиль» — Telegram покажет запрос на отправку номера. Подтвердите его, и номер появится автоматически в течение нескольких секунд." },
    ],
    comingSoon: "Раздел в разработке — скоро будет доступен",
    orderType_ready_quiz: "Готовый тест",
    orderType_custom_quiz: "Индивидуальный тест",
    status_awaiting_payment: "Ждёт оплаты",
    status_payment_review: "Чек на проверке",
    status_in_progress: "Принято",
    status_done: "Готово",
    status_sent: "Отправлено",
    status_rejected: "Отклонено",
    status_cancelled: "Отменён",
    status_pending: "Ожидание",
    status_approved: "Опубликовано",
    status_sold: "Продано",
    cardSubject: "Предмет", cardCourse: "Курс", cardFaculty: "Факультет", cardDepartment: "Кафедра",
    cardOrderNumber: "Заказ", cardStatus: "Статус", cardPrice: "Цена",
    loading: "Загрузка...",
    productTitle: "Объявление",
    cardSeller: "Продавец",
    expiresLabel: "Показывать до",
    expiresHint: "После этой даты объявление скроется из ленты",
    errExpiresRequired: "Укажите дату, до какой показывать объявление",
    errExpiresPast: "Дата не может быть в прошлом",
    editBtn: "Изменить",
    deleteBtn: "Удалить",
    deleteConfirm: "Удалить это объявление?",
    deleteSuccess: "Объявление удалено",
    deleteError: "Не удалось удалить объявление",
    saveBtn: "Сохранить",
    editListingTitle: "Изменить объявление",
    editSuccess: "Изменения сохранены",
    editError: "Не удалось сохранить изменения",
    similarProducts: "Похожие товары",
    commentsTitle: "Комментарии",
    noComments: "Пока нет комментариев — будьте первым!",
    commentPlaceholder: "Написать комментарий...",
    commentSend: "Отправить",
    errComment: "Не удалось отправить комментарий",
    commentActionsTitle: "Ваш отзыв",
    deleteCommentConfirm: "Удалить этот отзыв?",
    editCommentTitle: "Изменить отзыв",
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
    marketplacePreviewTitle: "Маркетплейстен",
    viewAllBtn: "Барлығын көру ›",
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
    contactAutoHint: "Telegram профиліңізден автоматты түрде қойылады",
    fillPreviousField: (label) => `Алдымен таңдаңыз: ${label}`,
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
    statOrders: "Тапсырыс", statListings: "Хабарландыру",
    referralTitle: "Досыңды шақыр",
    referralDesc: "Сенің шақыру кодың — досыңмен бөліс",
    referralInvitedLabel: "Шақырылды",
    referralShareBtn: "Кодпен бөлісу",
    referralShareText: "StudHub-қа кел — студенттерге арналған тесттер мен маркетплейс 🎓",
    referralInputPlaceholder: "Досыңның коды бар ма? Енгіз",
    referralApplyBtn: "Қолдану",
    referralCopied: "Код көшірілді",
    referralApplySuccess: "Код қолданылды!",
    referralApplyError: "Кодты қолдану мүмкін болмады",
    previewBtn: "Қарау", noPreview: "Сұрақтар мысалы әлі қосылмаған.",
    settingsLanguage: "Тіл",
    settingsShare: "Қосымшамен бөлісу",
    settingsShareDesc: "Достарыңа StudHub туралы айт",
    settingsShareText: "StudHub-қа қара — студенттерге арналған тесттер мен маркетплейс 🎓",
    notifOrdersLabel: "Тапсырыстар мен төлем", notifOrdersDesc: "Тапсырыс мәртебелері, төлемді растау",
    notifMarketLabel: "Маркетплейс", notifMarketDesc: "Хабарландыруларды модерациялау, сатып алушыларға жауап",
    notifNewsLabel: "Жаңалықтар мен акциялар", notifNewsDesc: "Жаңа мүмкіндіктер мен арнайы ұсыныстар",
    faqItems: [
      { q: "Тапсырысты қалай төлеймін?", a: "Тапсырыс рәсімделгеннен кейін бот Kaspi деректемелерін жібереді. Соманы аударып, чек скриншотын ботқа жіберіңіз — оператор растайды." },
      { q: "Дайын тестті қанша күтемін?", a: "Каталогтағы дайын тесттер төлем расталғаннан кейін бірден жіберіледі. Жеке тапсырыстар растаудан кейін бір жұмыс күні ішінде орындалады." },
      { q: "Тапсырысты бас тартуға бола ма?", a: "Иә, рәсімдеуден кейін бір сағат ішінде — «Тапсырыстар» бөлімінде төленбеген тапсырыстың жанында бас тарту түймесі шығады." },
      { q: "Хабарландыруды қалай орналастырамын?", a: "«Орналастыру» бөліміне өтіп, санатты таңдаңыз — Оқу немесе Тауар — және форманы толтырыңыз. Модератор тексергеннен кейін жарияланады." },
      { q: "Нөмір байланыспаса не істеу керек?", a: "«Профиль» бөлімін ашыңыз — Telegram нөмірді жіберу сұранысын көрсетеді. Растаңыз, нөмір бірнеше секундта өзі пайда болады." },
    ],
    comingSoon: "Бөлім әзірленуде — жақында қолжетімді болады",
    orderType_ready_quiz: "Дайын тест",
    orderType_custom_quiz: "Жеке тест",
    status_awaiting_payment: "Төлемді күтуде",
    status_payment_review: "Чек тексерілуде",
    status_in_progress: "Қабылданды",
    status_done: "Дайын",
    status_sent: "Жіберілді",
    status_rejected: "Қабылданбады",
    status_cancelled: "Бас тартылды",
    status_pending: "Күтуде",
    status_approved: "Жарияланды",
    status_sold: "Сатылды",
    cardSubject: "Пән", cardCourse: "Курс", cardFaculty: "Факультет", cardDepartment: "Кафедра",
    cardOrderNumber: "Тапсырыс", cardStatus: "Мәртебе", cardPrice: "Бағасы",
    loading: "Жүктелуде...",
    productTitle: "Хабарландыру",
    cardSeller: "Сатушы",
    expiresLabel: "Қашанға дейін көрсету",
    expiresHint: "Осы күннен кейін хабарландыру лентадан жасырылады",
    errExpiresRequired: "Хабарландыруды қашанға дейін көрсету керегін көрсетіңіз",
    errExpiresPast: "Күн өткен уақытта бола алмайды",
    editBtn: "Өзгерту",
    deleteBtn: "Жою",
    deleteConfirm: "Бұл хабарландыруды жоясыз ба?",
    deleteSuccess: "Хабарландыру жойылды",
    deleteError: "Хабарландыруды жою мүмкін болмады",
    saveBtn: "Сақтау",
    editListingTitle: "Хабарландыруды өзгерту",
    editSuccess: "Өзгерістер сақталды",
    editError: "Өзгерістерді сақтау мүмкін болмады",
    similarProducts: "Ұқсас тауарлар",
    commentsTitle: "Пікірлер",
    noComments: "Әзірге пікір жоқ — бірінші болыңыз!",
    commentPlaceholder: "Пікір жазу...",
    commentSend: "Жіберу",
    errComment: "Пікірді жіберу мүмкін болмады",
    commentActionsTitle: "Сіздің пікіріңіз",
    deleteCommentConfirm: "Бұл пікірді жоясыз ба?",
    editCommentTitle: "Пікірді өзгерту",
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
    marketplacePreviewTitle: "From the marketplace",
    viewAllBtn: "View all ›",
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
    contactAutoHint: "Filled in automatically from your Telegram profile",
    fillPreviousField: (label) => `Please select first: ${label}`,
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
    statOrders: "Orders", statListings: "Listings",
    referralTitle: "Invite a friend",
    referralDesc: "Your invite code — share it with friends",
    referralInvitedLabel: "Invited",
    referralShareBtn: "Share code",
    referralShareText: "Check out StudHub — quizzes and a marketplace for students 🎓",
    referralInputPlaceholder: "Have a friend's code? Enter it",
    referralApplyBtn: "Apply",
    referralCopied: "Code copied",
    referralApplySuccess: "Code applied!",
    referralApplyError: "Couldn't apply the code",
    previewBtn: "Preview", noPreview: "No sample questions added yet.",
    settingsLanguage: "Language",
    settingsShare: "Share the app",
    settingsShareDesc: "Tell your friends about StudHub",
    settingsShareText: "Check out StudHub — quizzes and a marketplace for students 🎓",
    notifOrdersLabel: "Orders & payment", notifOrdersDesc: "Order statuses, payment confirmations",
    notifMarketLabel: "Marketplace", notifMarketDesc: "Listing moderation, buyer replies",
    notifNewsLabel: "News & promos", notifNewsDesc: "New features and special offers",
    faqItems: [
      { q: "How do I pay for an order?", a: "After placing an order, the bot sends Kaspi payment details. Transfer the amount and send a screenshot of the receipt to the bot — an operator will confirm it." },
      { q: "How long until my quiz is ready?", a: "Ready-made quizzes from the catalog are sent right after payment is confirmed. Custom orders are completed within one working day after confirmation." },
      { q: "Can I cancel an order?", a: "Yes, within one hour of placing it — a cancel button appears next to the unpaid order in the Orders section." },
      { q: "How do I post a listing?", a: "Go to the Post section, choose a category — Study or Goods — and fill in the form. It goes live after a moderator reviews it." },
      { q: "What if my phone number didn't link?", a: "Open the Profile section — Telegram will show a prompt to share your number. Confirm it and the number will appear automatically within a few seconds." },
    ],
    comingSoon: "This section is coming soon",
    orderType_ready_quiz: "Ready-made quiz",
    orderType_custom_quiz: "Custom quiz",
    status_awaiting_payment: "Awaiting payment",
    status_payment_review: "Receipt under review",
    status_in_progress: "Accepted",
    status_done: "Done",
    status_sent: "Sent",
    status_rejected: "Rejected",
    status_cancelled: "Cancelled",
    status_pending: "Pending",
    status_approved: "Published",
    status_sold: "Sold",
    cardSubject: "Subject", cardCourse: "Course", cardFaculty: "Faculty", cardDepartment: "Department",
    cardOrderNumber: "Order", cardStatus: "Status", cardPrice: "Price",
    loading: "Loading...",
    productTitle: "Listing",
    cardSeller: "Seller",
    expiresLabel: "Show until",
    expiresHint: "The listing will disappear from the feed after this date",
    errExpiresRequired: "Please choose a date to show the listing until",
    errExpiresPast: "The date can't be in the past",
    editBtn: "Edit",
    deleteBtn: "Delete",
    deleteConfirm: "Delete this listing?",
    deleteSuccess: "Listing deleted",
    deleteError: "Couldn't delete the listing",
    saveBtn: "Save",
    editListingTitle: "Edit listing",
    editSuccess: "Changes saved",
    editError: "Couldn't save changes",
    similarProducts: "Similar items",
    commentsTitle: "Comments",
    noComments: "No comments yet — be the first!",
    commentPlaceholder: "Write a comment...",
    commentSend: "Send",
    errComment: "Couldn't send the comment",
    commentActionsTitle: "Your review",
    deleteCommentConfirm: "Delete this review?",
    editCommentTitle: "Edit review",
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
    marketplacePreviewTitle: "Bazardan",
    viewAllBtn: "Ählisini görmek ›",
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
    contactAutoHint: "Telegram profiliňizden awtomatiki goýulýar",
    fillPreviousField: (label) => `Ilki saýlaň: ${label}`,
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
    statOrders: "Sargytlar", statListings: "Bildirişler",
    referralTitle: "Dostuňy çagyr",
    referralDesc: "Seniň çakylyk koduň — dostuň bilen paýlaş",
    referralInvitedLabel: "Çagyryldy",
    referralShareBtn: "Kody paýlaşmak",
    referralShareText: "StudHub-a gel — talyplar üçin testler we bazar 🎓",
    referralInputPlaceholder: "Dostuňyň kody barmy? Ýazyň",
    referralApplyBtn: "Ulanmak",
    referralCopied: "Kod göçürildi",
    referralApplySuccess: "Kod ulanyldy!",
    referralApplyError: "Kody ulanmak başartmady",
    previewBtn: "Görmek", noPreview: "Sorag mysaly entek goşulmady.",
    settingsLanguage: "Dil",
    settingsShare: "Programmany paýlaşmak",
    settingsShareDesc: "Dostlaryňa StudHub barada aýt",
    settingsShareText: "StudHub-a serediň — talyplar üçin testler we bazar 🎓",
    notifOrdersLabel: "Sargytlar we töleg", notifOrdersDesc: "Sargyt ýagdaýlary, töleg tassyklamalary",
    notifMarketLabel: "Bazar", notifMarketDesc: "Bildirişleri barlamak, alyjylara jogap",
    notifNewsLabel: "Habarlar we aksiýalar", notifNewsDesc: "Täze mümkinçilikler we ýörite teklipler",
    faqItems: [
      { q: "Sargydy nädip töleýärin?", a: "Sargyt resmileşdirilenden soň bot Kaspi maglumatlaryny iberer. Puly geçirip, çekiň suratyny bota iberiň — operator tassyklar." },
      { q: "Taýýar testi näçe wagt garaşmaly?", a: "Katalogdaky taýýar testler töleg tassyklanandan soň derrew iberilýär. Şahsy sargytlar tassyklanandan soň bir iş güni içinde ýerine ýetirilýär." },
      { q: "Sargydy ýatyryp bolarmy?", a: "Hawa, resmileşdirenden soň bir sagadyň dowamynda — Sargytlar bölüminde tölenmedik sargydyň gapdalynda ýatyrmak düwmesi çykýar." },
      { q: "Bildirişi nädip ýerleşdirýärin?", a: "Ýerleşdirmek bölümine geçiň, kategoriýany saýlaň — Okuw ýa-da Haryt — we formany dolduryň. Moderator barlanyndan soň çap ediler." },
      { q: "Belgi baglanmasa näme etmeli?", a: "Profil bölümini açyň — Telegram belgini ibermek üçin haýyş görkezer. Tassyklaň, belgi birnäçe sekuntda özi peýda bolar." },
    ],
    comingSoon: "Bölüm ýakynda elýeterli bolar",
    orderType_ready_quiz: "Taýýar test",
    orderType_custom_quiz: "Şahsy test",
    status_awaiting_payment: "Töleg garaşylýar",
    status_payment_review: "Çek barlanýar",
    status_in_progress: "Kabul edildi",
    status_done: "Taýýar",
    status_sent: "Iberildi",
    status_rejected: "Ret edildi",
    status_cancelled: "Ýatyryldy",
    status_pending: "Garaşylýar",
    status_approved: "Çap edildi",
    status_sold: "Satyldy",
    cardSubject: "Dersi", cardCourse: "Kurs", cardFaculty: "Fakultet", cardDepartment: "Kafedra",
    cardOrderNumber: "Sargyt", cardStatus: "Ýagdaýy", cardPrice: "Bahasy",
    loading: "Ýüklenýär...",
    productTitle: "Bildiriş",
    cardSeller: "Satyjy",
    expiresLabel: "Haçana çenli görkezmeli",
    expiresHint: "Bu senededen soň bildiriş lentadan gizlener",
    errExpiresRequired: "Bildirişi haçana çenli görkezmelidigini saýlaň",
    errExpiresPast: "Sene geçmişde bolup bilmez",
    editBtn: "Üýtgetmek",
    deleteBtn: "Pozmak",
    deleteConfirm: "Bu bildirişi pozmalymy?",
    deleteSuccess: "Bildiriş pozuldy",
    deleteError: "Bildirişi pozmak başartmady",
    saveBtn: "Ýatda saklamak",
    editListingTitle: "Bildirişi üýtgetmek",
    editSuccess: "Üýtgeşmeler ýatda saklandy",
    editError: "Üýtgeşmeleri ýatda saklamak başartmady",
    similarProducts: "Meňzeş harytlar",
    commentsTitle: "Teswirler",
    noComments: "Entek teswir ýok — birinji boluň!",
    commentPlaceholder: "Teswir ýazyň...",
    commentSend: "Ibermek",
    errComment: "Teswiri ibermek başartmady",
    commentActionsTitle: "Siziň teswiriňiz",
    deleteCommentConfirm: "Bu teswiri pozmalymy?",
    editCommentTitle: "Teswiri üýtgetmek",
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
  renderPostFieldLabels();
  renderBanner();
  loadCatalog();
  loadHomeListingsPreview();
  loadListings();
  renderPhoneRow();

  // Если сейчас открыт подэкран (FAQ/Уведомления/Настройки) — перерисовываем
  // его на месте, чтобы язык обновился сразу, без выхода и повторного входа.
  if (!subscreen.classList.contains("hidden") && activeSubscreenRenderer) {
    activeSubscreenRenderer();
  }
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
    window.__catalogItems = items;
    list.innerHTML = items.map((item) => `
      <div class="card">
        <div class="quiz-card-title">${item.title}</div>
        ${item.subject ? `<div class="quiz-card-subject">${item.subject}</div>` : ""}
        <div class="card-attrs">
          ${item.faculty ? `<div class="card-attr"><b>${t("cardFaculty")}:</b> ${item.faculty}</div>` : ""}
          ${item.department ? `<div class="card-attr"><b>${t("cardDepartment")}:</b> ${item.department}</div>` : ""}
          ${item.course ? `<div class="card-attr"><b>${t("cardCourse")}:</b> ${item.course}</div>` : ""}
        </div>
        <div class="card-price">${item.price}₸</div>
        <div class="quiz-card-btn-row">
          <button class="btn-outline" onclick="previewQuiz(${item.id})">${t("previewBtn")}</button>
          <button class="btn-primary" onclick="buyReadyQuiz(${item.id})">${t("buyBtn")}</button>
        </div>
      </div>
    `).join("");
  } catch (e) {
    list.innerHTML = `<p class="hint">${t("errCatalog")}</p>`;
  }
}

function previewQuiz(catalogItemId) {
  const item = (window.__catalogItems || []).find((i) => i.id === catalogItemId);
  if (!item) return;
  document.getElementById("preview-title").textContent = item.title;
  document.getElementById("preview-body").textContent = item.preview_text || t("noPreview");
  document.getElementById("preview-overlay").classList.remove("hidden");
}

document.getElementById("preview-close").addEventListener("click", () => {
  document.getElementById("preview-overlay").classList.add("hidden");
});
document.getElementById("preview-overlay").addEventListener("click", (e) => {
  if (e.target.id === "preview-overlay") document.getElementById("preview-overlay").classList.add("hidden");
});

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

// ---------- Попап автокомплита (два режима: фильтр категорий и форма «Разместить») ----------
const searchOverlay = document.getElementById("search-overlay");
const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");
let activeSearchField = null;
let activeSearchMode = "filter"; // "filter" | "post"
let searchDebounce = null;

async function runSearch(field, query, categoryOverride, cascadeParams) {
  try {
    const params = new URLSearchParams({ q: query });
    const cat = categoryOverride !== undefined ? categoryOverride : selectedCategory;
    if (cat) params.set("category", cat);
    if (cascadeParams) {
      Object.entries(cascadeParams).forEach(([k, v]) => { if (v) params.set(k, v); });
    }
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
      if (activeSearchMode === "filter") {
        filters[activeSearchField] = el.dataset.value;
        renderFilterButtonLabels();
        if (activeSearchField === "subcategory") renderSubcategoryChips();
        loadListings();
      } else {
        postFields[activeSearchField] = el.dataset.value;
        resetDownstreamFields(activeSearchField);
        renderPostFieldLabels();
      }
      searchOverlay.classList.add("hidden");
    });
  });
}

document.querySelectorAll(".filter-field-btn[data-field]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    activeSearchMode = "filter";
    activeSearchField = btn.dataset.field;
    searchInput.value = "";
    searchOverlay.classList.remove("hidden");
    searchInput.focus();
    renderSearchResults(await runSearch(activeSearchField, ""));
  });
});

document.querySelectorAll(".filter-field-btn[data-post-field]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    if (!postCategory) return;
    if (btn.classList.contains("disabled")) {
      const idx = CASCADE_ORDER.indexOf(btn.dataset.postField);
      const prevField = idx > 0 ? CASCADE_ORDER[idx - 1] : null;
      const prevLabel = prevField ? t(POST_FIELD_LABEL_KEYS[prevField]) : "";
      showToast(t("fillPreviousField")(prevLabel));
      return;
    }
    activeSearchMode = "post";
    activeSearchField = btn.dataset.postField;
    searchInput.value = "";
    searchOverlay.classList.remove("hidden");
    searchInput.focus();
    renderSearchResults(await runSearch(activeSearchField, "", postCategory, {
      faculty: postFields.faculty,
      department: postFields.department,
      course: postFields.course,
      group_name: postFields.group_name,
    }));
  });
});

searchInput.addEventListener("input", () => {
  clearTimeout(searchDebounce);
  const query = searchInput.value.trim();
  searchDebounce = setTimeout(async () => {
    const cat = activeSearchMode === "post" ? postCategory : undefined;
    renderSearchResults(await runSearch(activeSearchField, query, cat));
  }, 250);
});

searchOverlay.addEventListener("click", (e) => {
  if (e.target === searchOverlay) searchOverlay.classList.add("hidden");
});

// ---------- Маркетплейс: лента ----------
function renderMarketplaceCard(item) {
  return `
    <div class="card listing-card">
      <div class="listing-card-row" onclick="openProductScreen(${item.id})">
        ${item.photo_urls && item.photo_urls[0]
          ? `<img class="listing-card-thumb-sm" src="${item.photo_urls[0]}" alt="">`
          : `<div class="listing-card-thumb-placeholder">📦</div>`}
        <div class="listing-card-info">
          <div class="card-title">${item.title}</div>
          ${item.price ? `<div class="card-price">${item.price}₸</div>` : ""}
        </div>
      </div>
      <div class="card-desc">${item.description || ""}</div>
      <div class="card-btn-row">
        <button class="btn-outline" onclick="openProductScreen(${item.id})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
          ${t("previewBtn")}
        </button>
        <button class="btn-secondary" onclick="window.open('https://t.me/${item.contact.replace('@','')}', '_blank')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          ${t("contactSellerBtn")}
        </button>
      </div>
    </div>
  `;
}

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
    list.innerHTML = items.map(renderMarketplaceCard).join("");
  } catch (e) {
    list.innerHTML = `<p class="hint">${t("errListings")}</p>`;
  }
}

async function loadHomeListingsPreview() {
  const list = document.getElementById("home-listings-preview");
  if (!list) return;
  try {
    const res = await fetch(`${API_BASE}/marketplace/listings`);
    const items = await res.json();
    if (!items.length) { list.innerHTML = `<p class="hint">${t("emptyListings")}</p>`; return; }
    list.innerHTML = items.slice(0, 4).map(renderMarketplaceCard).join("");
  } catch (e) {
    list.innerHTML = `<p class="hint">${t("errListings")}</p>`;
  }
}

document.getElementById("btn-view-all-listings")?.addEventListener("click", () => {
  document.querySelector('.nav-item[data-tab="categories"]')?.click();
});

// ---------- Экран деталей объявления ----------
const productScreen = document.getElementById("product-screen");
const productBody = document.getElementById("product-body");
let currentProductId = null;

async function openProductScreen(listingId) {
  currentProductId = listingId;
  productBody.innerHTML = `<p class="hint">${t("loading")}</p>`;
  productScreen.classList.remove("hidden");

  try {
    const [listing, similar, comments] = await Promise.all([
      fetch(`${API_BASE}/marketplace/listings/${listingId}`).then((r) => r.json()),
      fetch(`${API_BASE}/marketplace/listings/${listingId}/similar`).then((r) => r.json()),
      fetch(`${API_BASE}/marketplace/listings/${listingId}/comments`).then((r) => r.json()),
    ]);
    renderProductScreen(listing, similar, comments);
  } catch (e) {
    productBody.innerHTML = `<p class="hint">${t("errListings")}</p>`;
  }
}

function renderProductScreen(listing, similar, comments) {
  const photosHtml = listing.photo_urls && listing.photo_urls.length
    ? `<div class="product-photos">${listing.photo_urls.map((url) => `<img src="${url}" alt="" onclick="openFullscreenPhoto('${url}')">`).join("")}</div>`
    : `<div class="product-photos-empty">📦</div>`;

  const sellerInitial = (listing.seller_name || "?").trim()[0]?.toUpperCase() || "?";

  const commentsHtml = comments.length
    ? comments.map((c) => `
        <div class="comment-item" data-comment-id="${c.id}" data-author-tg-id="${c.author_tg_id}" data-text="${escapeHtml(c.text)}" data-rating="${c.rating || 0}">
          <div class="comment-author-row">
            <div class="comment-author">${escapeHtml(c.author_name)}</div>
            ${c.rating ? `<div class="comment-stars">${renderStars(c.rating)}</div>` : ""}
          </div>
          <div class="comment-text">${escapeHtml(c.text)}</div>
        </div>
      `).join("")
    : `<p class="hint">${t("noComments")}</p>`;

  const similarHtml = similar.length
    ? `<div class="similar-scroll">${similar.map((s) => `
        <div class="similar-card" onclick="openProductScreen(${s.id})">
          ${s.photo_urls && s.photo_urls[0]
            ? `<img src="${s.photo_urls[0]}" alt="">`
            : `<div class="similar-card-photo-placeholder">📦</div>`}
          <div class="similar-card-title">${s.title}</div>
          ${s.price ? `<div class="similar-card-price">${s.price}₸</div>` : ""}
        </div>
      `).join("")}</div>`
    : "";

  productBody.innerHTML = `
    ${photosHtml}
    <div class="product-title">${listing.title}</div>
    ${listing.price ? `<div class="product-price">${listing.price}₸</div>` : ""}
    <div class="product-desc">${listing.description || ""}</div>

    <div class="product-seller-row">
      <div class="product-seller-avatar">${sellerInitial}</div>
      <div>
        <div class="product-seller-name">${listing.seller_name || t("cardSeller")}</div>
        <div class="product-seller-label">${t("cardSeller")}</div>
      </div>
      <button class="btn-primary" style="width:auto; margin-left:auto; padding:8px 16px; font-size:13px;"
        onclick="window.open('https://t.me/${listing.contact.replace('@','')}', '_blank')">
        ${t("contactSellerBtn")}
      </button>
    </div>

    ${similar.length ? `<div class="product-section-title">${t("similarProducts")}</div>${similarHtml}` : ""}

    <div class="product-section-title">${t("commentsTitle")}</div>
    <div id="comments-list">${commentsHtml}</div>

    <div class="rating-picker" id="rating-picker">
      ${[1, 2, 3, 4, 5].map((n) => `<span class="rating-star" data-value="${n}">★</span>`).join("")}
    </div>
    <div class="comment-form">
      <input id="comment-input" class="comment-input" type="text" placeholder="${t("commentPlaceholder")}">
      <button id="comment-send" class="comment-send" type="button" aria-label="${t("commentSend")}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </button>
    </div>
  `;

  selectedRating = 0;
  document.querySelectorAll("#rating-picker .rating-star").forEach((star) => {
    star.addEventListener("click", () => {
      selectedRating = selectedRating === Number(star.dataset.value) ? 0 : Number(star.dataset.value);
      renderRatingPicker();
    });
  });

  document.getElementById("comment-send").addEventListener("click", submitComment);
  document.getElementById("comment-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") submitComment();
  });

  bindOwnCommentLongPress();
}

function bindOwnCommentLongPress() {
  document.querySelectorAll(".comment-item").forEach((el) => {
    const authorTgId = Number(el.dataset.authorTgId);
    if (!currentUser.tg_id || authorTgId !== currentUser.tg_id) return;

    el.classList.add("comment-item-own");
    let pressTimer = null;

    const startPress = () => {
      pressTimer = setTimeout(() => openCommentActionSheet(el), 500);
    };
    const cancelPress = () => clearTimeout(pressTimer);

    el.addEventListener("touchstart", startPress);
    el.addEventListener("touchend", cancelPress);
    el.addEventListener("touchmove", cancelPress);
    el.addEventListener("mousedown", startPress);
    el.addEventListener("mouseup", cancelPress);
    el.addEventListener("mouseleave", cancelPress);
  });
}

function openCommentActionSheet(el) {
  const commentId = el.dataset.commentId;
  const text = el.dataset.text;
  const rating = Number(el.dataset.rating) || 0;

  const html = `
    <button class="profile-item" id="comment-edit-btn">
      <span class="profile-item-icon">✏️</span>
      <span class="profile-item-label">${t("editBtn")}</span>
    </button>
    <button class="profile-item" id="comment-delete-btn">
      <span class="profile-item-icon">🗑️</span>
      <span class="profile-item-label" style="color:#e53935;">${t("deleteBtn")}</span>
    </button>
  `;
  document.getElementById("preview-title").textContent = t("commentActionsTitle");
  document.getElementById("preview-body").innerHTML = `<div class="profile-menu">${html}</div>`;
  document.getElementById("preview-overlay").classList.remove("hidden");

  document.getElementById("comment-edit-btn").addEventListener("click", () => {
    document.getElementById("preview-overlay").classList.add("hidden");
    openEditCommentForm(commentId, text, rating);
  });

  document.getElementById("comment-delete-btn").addEventListener("click", async () => {
    document.getElementById("preview-overlay").classList.add("hidden");
    if (!confirm(t("deleteCommentConfirm"))) return;
    try {
      const res = await fetch(`${API_BASE}/marketplace/comments/${commentId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tg_id: currentUser.tg_id }),
      });
      if (!res.ok) throw new Error();
      openProductScreen(currentProductId);
    } catch (e) {
      showToast(t("errComment"));
    }
  });
}

function openEditCommentForm(commentId, text, rating) {
  let editRating = rating;
  const html = `
    <div class="rating-picker" id="edit-rating-picker">
      ${[1, 2, 3, 4, 5].map((n) => `<span class="rating-star ${n <= editRating ? "active" : ""}" data-value="${n}">★</span>`).join("")}
    </div>
    <textarea id="edit-comment-text" class="comment-edit-textarea">${text}</textarea>
    <button id="edit-comment-save" class="btn-primary">${t("saveBtn")}</button>
  `;
  document.getElementById("preview-title").textContent = t("editCommentTitle");
  document.getElementById("preview-body").innerHTML = html;
  document.getElementById("preview-overlay").classList.remove("hidden");

  document.querySelectorAll("#edit-rating-picker .rating-star").forEach((star) => {
    star.addEventListener("click", () => {
      editRating = editRating === Number(star.dataset.value) ? 0 : Number(star.dataset.value);
      document.querySelectorAll("#edit-rating-picker .rating-star").forEach((s) => {
        s.classList.toggle("active", Number(s.dataset.value) <= editRating);
      });
    });
  });

  document.getElementById("edit-comment-save").addEventListener("click", async () => {
    const newText = document.getElementById("edit-comment-text").value.trim();
    if (!newText) return;
    try {
      const res = await fetch(`${API_BASE}/marketplace/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tg_id: currentUser.tg_id, text: newText, rating: editRating || null }),
      });
      if (!res.ok) throw new Error();
      document.getElementById("preview-overlay").classList.add("hidden");
      openProductScreen(currentProductId);
    } catch (e) {
      showToast(t("errComment"));
    }
  });
}

function renderStars(rating) {
  return [1, 2, 3, 4, 5].map((n) => `<span class="${n <= rating ? "star-filled" : "star-empty"}">★</span>`).join("");
}

let selectedRating = 0;

function renderRatingPicker() {
  document.querySelectorAll("#rating-picker .rating-star").forEach((star) => {
    star.classList.toggle("active", Number(star.dataset.value) <= selectedRating);
  });
}

async function submitComment() {
  const input = document.getElementById("comment-input");
  const text = input.value.trim();
  if (!text || !currentProductId) return;

  try {
    const res = await fetch(`${API_BASE}/marketplace/listings/${currentProductId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...currentUser, text, rating: selectedRating || null }),
    });
    if (!res.ok) throw new Error();
    input.value = "";
    openProductScreen(currentProductId);
  } catch (e) {
    showToast(t("errComment"));
  }
}

function openFullscreenPhoto(url) {
  document.getElementById("fullscreen-photo-img").src = url;
  document.getElementById("fullscreen-photo-overlay").classList.remove("hidden");
}

document.getElementById("fullscreen-photo-close").addEventListener("click", () => {
  document.getElementById("fullscreen-photo-overlay").classList.add("hidden");
});
document.getElementById("fullscreen-photo-overlay").addEventListener("click", (e) => {
  if (e.target.id === "fullscreen-photo-overlay") {
    document.getElementById("fullscreen-photo-overlay").classList.add("hidden");
  }
});

document.getElementById("product-back").addEventListener("click", () => {
  productScreen.classList.add("hidden");
  currentProductId = null;
});

// ---------- Разместить: категория → показать форму, автоподстановка контакта ----------
let postCategory = null;
const postFields = { subcategory: "", course: "", group_name: "", faculty: "", department: "", subject: "" };

const POST_FIELD_LABEL_KEYS = {
  subcategory: "fSubcategory", course: "fCourse", group_name: "fGroup",
  faculty: "fFaculty", department: "fDepartment", subject: "fSubject",
};

// Цепочка зависимости: каждое следующее поле требует, чтобы предыдущее было заполнено,
// и его варианты сужаются по уже выбранным значениям слева.
const CASCADE_ORDER = ["faculty", "department", "course", "group_name", "subject"];

function renderPostFieldLabels() {
  document.querySelectorAll(".filter-field-btn[data-post-field]").forEach((btn) => {
    const field = btn.dataset.postField;
    const value = postFields[field];
    const label = t(POST_FIELD_LABEL_KEYS[field]) || field;
    btn.textContent = value ? `${label}: ${value}` : label;
    btn.classList.toggle("has-value", !!value);

    const idx = CASCADE_ORDER.indexOf(field);
    const isGated = idx > 0 && !postFields[CASCADE_ORDER[idx - 1]];
    btn.classList.toggle("disabled", isGated);
  });
}

function resetDownstreamFields(field) {
  const idx = CASCADE_ORDER.indexOf(field);
  if (idx === -1) return;
  CASCADE_ORDER.slice(idx + 1).forEach((f) => { postFields[f] = ""; });
}

function fillContactField() {
  const contactField = document.getElementById("lf-contact");
  contactField.value = currentUser.username ? "@" + currentUser.username : (currentUser.full_name || "—");
}

document.querySelectorAll("#post-cat-tiles .cat-pill").forEach((pill) => {
  pill.addEventListener("click", () => {
    document.querySelectorAll("#post-cat-tiles .cat-pill").forEach((b) => b.classList.remove("active"));
    pill.classList.add("active");
    postCategory = pill.dataset.category;
    document.getElementById("post-form").classList.remove("hidden");
    document.getElementById("post-academic-fields").classList.toggle("hidden", postCategory === "goods");

    Object.keys(postFields).forEach((k) => (postFields[k] = ""));
    renderPostFieldLabels();
    fillContactField();
  });
});

let selectedListingFiles = [];

function renderListingPhotoPreviews() {
  const container = document.getElementById("lf-photos-preview");
  container.innerHTML = selectedListingFiles.map((file, idx) => `
    <div class="photo-thumb" data-idx="${idx}">
      <img src="${URL.createObjectURL(file)}" alt="">
      <button type="button" class="photo-thumb-remove" data-idx="${idx}">✕</button>
    </div>
  `).join("");

  container.querySelectorAll(".photo-thumb-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedListingFiles.splice(Number(btn.dataset.idx), 1);
      renderListingPhotoPreviews();
    });
  });
}

document.getElementById("lf-file").addEventListener("change", (e) => {
  selectedListingFiles = selectedListingFiles.concat(Array.from(e.target.files || []));
  renderListingPhotoPreviews();
  e.target.value = ""; // сбрасываем, чтобы повторный выбор тех же файлов тоже сработал
});

// Цена: только цифры, живое форматирование пробелами по разрядам (5000 → 5 000)
const lfPriceInput = document.getElementById("lf-price");
lfPriceInput.addEventListener("input", () => {
  const digitsOnly = lfPriceInput.value.replace(/\D/g, "");
  lfPriceInput.value = digitsOnly ? Number(digitsOnly).toLocaleString("ru-RU").replace(/,/g, " ") : "";
});

document.getElementById("lf-submit").addEventListener("click", async () => {
  if (!postCategory) return;

  const title = document.getElementById("lf-title").value.trim();
  const description = document.getElementById("lf-description").value.trim();
  const price = lfPriceInput.value.replace(/\D/g, "");
  const contact = document.getElementById("lf-contact").value.trim();
  const expiresDate = document.getElementById("lf-expires").value;

  if (!title || !description || !price || !contact || !postFields.subcategory) {
    showToast(t("errFields"));
    return;
  }

  if (postCategory === "study") {
    const missingAcademic = ["faculty", "department", "course", "group_name", "subject"]
      .some((f) => !postFields[f]);
    if (missingAcademic) { showToast(t("errFields")); return; }
  }

  if (!expiresDate) { showToast(t("errExpiresRequired")); return; }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const chosenDate = new Date(expiresDate);
  if (chosenDate < today) { showToast(t("errExpiresPast")); return; }

  let photoUrls = [];
  try {
    if (selectedListingFiles.length) {
      showToast(t("uploading"));
      photoUrls = await Promise.all(selectedListingFiles.map(uploadFile));
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
        subcategory: postFields.subcategory || null,
        description: description || null,
        price: price ? parseInt(price, 10) : null,
        contact,
        photo_urls: photoUrls.length ? photoUrls : null,
        course: postFields.course || null,
        group_name: postFields.group_name || null,
        faculty: postFields.faculty || null,
        department: postFields.department || null,
        subject: postFields.subject || null,
        expires_at: expiresDate ? new Date(expiresDate + "T23:59:00").toISOString() : null,
      }),
    });
    if (!res.ok) throw new Error();
    showToast(t("listingSent"));
    ["lf-title", "lf-description", "lf-price", "lf-expires"].forEach((id) => { document.getElementById(id).value = ""; });
    Object.keys(postFields).forEach((k) => (postFields[k] = ""));
    renderPostFieldLabels();
    selectedListingFiles = [];
    renderListingPhotoPreviews();
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

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function renderOrderCard(o) {
  const dash = "—";
  const rows = [
    [t("cardFaculty"), o.faculty || dash],
    [t("cardDepartment"), o.department || dash],
    [t("cardCourse"), o.course || dash],
    [t("fGroup"), o.group_name || dash],
  ];

  const rowsHtml = rows.map(([label, value]) =>
    `<div class="order-row"><b>${label}:</b> ${escapeHtml(value)}</div>`
  ).join("");

  const statusRow = `<div class="order-row"><b>${t("cardStatus")}:</b> ${t("status_" + o.status)}</div>`;
  const reasonRow = (o.status === "rejected" && o.rejection_reason)
    ? `<div class="order-row order-reject-reason">${escapeHtml(o.rejection_reason)}</div>`
    : "";

  return `
    <div class="card" data-order-id="${o.id}">
      <div class="order-row order-number"><b>${t("cardOrderNumber")} №${o.id}</b></div>
      <div class="order-row order-title">${escapeHtml(o.title || t("orderType_" + o.order_type))}</div>
      ${rowsHtml}
      <div class="order-row"><b>${t("cardPrice")}:</b> ${o.price}₸</div>
      ${statusRow}
      ${reasonRow}
      ${o.can_cancel ? `<button class="btn-cancel" onclick="cancelOrder(${o.id})">${t("cancelBtn")(Math.ceil(o.cancel_seconds_left / 60))}</button>` : ""}
    </div>
  `;
}

async function loadMyOrders() {
  const list = document.getElementById("orders-list");
  if (!currentUser.tg_id) { list.innerHTML = `<p class="hint">${t("emptyOrders")}</p>`; return; }
  try {
    const res = await fetch(`${API_BASE}/users/${currentUser.tg_id}/orders`);
    const items = await res.json();
    if (!items.length) { list.innerHTML = `<p class="hint">${t("emptyOrders")}</p>`; return; }
    list.innerHTML = items.map(renderOrderCard).join("");
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
      <div class="card listing-card">
        <div class="listing-card-row" onclick="openProductScreen(${l.id})">
          ${l.photo_urls && l.photo_urls[0]
            ? `<img class="listing-card-thumb-sm" src="${l.photo_urls[0]}" alt="">`
            : `<div class="listing-card-thumb-placeholder">📦</div>`}
          <div class="listing-card-info">
            <div class="card-title">${l.title}</div>
            <div class="card-desc">${l.price ? l.price + "₸" : ""}</div>
          </div>
          <span class="status-badge">${t("status_" + l.status)}</span>
        </div>
        ${l.expires_at ? `<div class="hint listing-expiry">${t("expiresLabel")}: ${formatDate(l.expires_at)}</div>` : ""}
        <div class="card-btn-row">
          <button class="btn-outline" onclick="openEditListing(${l.id})">${t("editBtn")}</button>
          <button class="btn-danger" onclick="deleteMyListing(${l.id})">${t("deleteBtn")}</button>
        </div>
      </div>
    `).join("");
  } catch (e) {
    list.innerHTML = `<p class="hint">${t("errListings")}</p>`;
  }
}

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString(currentLang === "RU" ? "ru-RU" : "en-GB");
}

async function deleteMyListing(listingId) {
  if (!confirm(t("deleteConfirm"))) return;
  try {
    const res = await fetch(`${API_BASE}/marketplace/listings/${listingId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tg_id: currentUser.tg_id }),
    });
    if (!res.ok) throw new Error();
    showToast(t("deleteSuccess"));
    loadMyListings();
  } catch (e) {
    showToast(t("deleteError"));
  }
}

async function openEditListing(listingId) {
  let listing;
  try {
    listing = await fetch(`${API_BASE}/marketplace/listings/${listingId}`).then((r) => r.json());
  } catch (e) {
    showToast(t("errListings"));
    return;
  }

  const expiryValue = listing.expires_at ? listing.expires_at.slice(0, 10) : "";
  const html = `
    <div class="form">
      <label>${t("lfTitleLabel")}</label>
      <input id="edit-title" type="text" value="${escapeHtml(listing.title)}">

      <label>${t("lfDescLabel")}</label>
      <textarea id="edit-description">${escapeHtml(listing.description || "")}</textarea>

      <label>${t("lfPriceLabel")}</label>
      <input id="edit-price" type="text" inputmode="numeric" value="${listing.price ? Number(listing.price).toLocaleString("ru-RU").replace(/,/g, " ") : ""}">

      <label>${t("lfContactLabel")}</label>
      <input id="edit-contact" type="text" value="${escapeHtml(listing.contact)}">

      <label>${t("expiresLabel")}</label>
      <input id="edit-expires" type="date" value="${expiryValue}">

      <button id="edit-submit" class="btn-primary">${t("saveBtn")}</button>
    </div>
  `;
  openSubscreen("editListingTitle", html);

  document.getElementById("edit-price").addEventListener("input", (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "");
    e.target.value = digitsOnly ? Number(digitsOnly).toLocaleString("ru-RU").replace(/,/g, " ") : "";
  });

  document.getElementById("edit-submit").addEventListener("click", async () => {
    const title = document.getElementById("edit-title").value.trim();
    const description = document.getElementById("edit-description").value.trim();
    const price = document.getElementById("edit-price").value.replace(/\D/g, "");
    const contact = document.getElementById("edit-contact").value.trim();
    const expiresDate = document.getElementById("edit-expires").value;

    try {
      const res = await fetch(`${API_BASE}/marketplace/listings/${listingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tg_id: currentUser.tg_id,
          title: title || null,
          description: description || null,
          price: price ? parseInt(price, 10) : null,
          contact: contact || null,
          expires_at: expiresDate ? new Date(expiresDate + "T23:59:00").toISOString() : null,
        }),
      });
      if (!res.ok) throw new Error();
      showToast(t("editSuccess"));
      subscreen.classList.add("hidden");
      loadMyListings();
    } catch (e) {
      showToast(t("editError"));
    }
  });
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
  loadProfileStats();
  renderReferralBlock();

  // Номер показываем так же "само собой", как имя и username — без отдельной
  // кнопки. Если ещё не привязан, один раз за сессию тихо запрашиваем его.
  if (!profileData?.phone && !phoneAutoRequested) {
    phoneAutoRequested = true;
    requestPhoneAndPoll();
  }
}

async function loadProfileStats() {
  if (!currentUser.tg_id) return;
  try {
    const [orders, listings] = await Promise.all([
      fetch(`${API_BASE}/users/${currentUser.tg_id}/orders`).then((r) => r.json()),
      fetch(`${API_BASE}/users/${currentUser.tg_id}/listings`).then((r) => r.json()),
    ]);
    document.getElementById("stat-orders").textContent = orders.length;
    document.getElementById("stat-listings").textContent = listings.length;
  } catch (e) { /* тихо игнорируем */ }
}

function renderReferralBlock() {
  if (!currentUser.tg_id) return;
  document.getElementById("referral-code").textContent = "#" + currentUser.tg_id;
  const invitedEl = document.querySelector(".referral-stats");
  if (invitedEl) invitedEl.textContent = `${t("referralInvitedLabel")}: ${profileData?.referral_count ?? 0}`;
}

function referralLink() {
  const botUsername = profileData?.bot_username || "your_bot";
  return `https://t.me/${botUsername}?start=ref_${currentUser.tg_id}`;
}

document.getElementById("btn-copy-referral").addEventListener("click", async () => {
  const code = "#" + currentUser.tg_id;
  try {
    await navigator.clipboard.writeText(code);
    showToast(t("referralCopied"));
  } catch (e) {
    showToast(code);
  }
});

document.getElementById("btn-share-referral").addEventListener("click", () => {
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink())}&text=${encodeURIComponent(t("referralShareText"))}`;
  if (tg.openTelegramLink) {
    tg.openTelegramLink(shareUrl);
  } else {
    window.open(shareUrl, "_blank");
  }
});

document.getElementById("btn-apply-referral").addEventListener("click", async () => {
  const input = document.getElementById("referral-code-input");
  const code = input.value.trim();
  if (!code) return;

  try {
    const res = await fetch(`${API_BASE}/users/apply-referral`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tg_id: currentUser.tg_id, referral_code: code }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      showToast(err?.detail || t("referralApplyError"));
      return;
    }
    showToast(t("referralApplySuccess"));
    input.value = "";
  } catch (e) {
    showToast(t("referralApplyError"));
  }
});

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

let phoneAutoRequested = false;

function requestPhoneAndPoll() {
  // Поллим профиль независимо от того, что вернул коллбэк requestContact —
  // на части клиентов Telegram он не сообщает true, даже если контакт реально отправлен.
  const poll = () => {
    let attempts = 0;
    const timer = setInterval(async () => {
      attempts += 1;
      try {
        const fresh = await fetchProfile();
        if (fresh.phone) {
          profileData = fresh;
          renderPhoneRow();
          clearInterval(timer);
        }
      } catch (e) { /* игнор, попробуем ещё раз */ }
      if (attempts >= 10) clearInterval(timer);
    }, 1500);
  };

  if (tg.requestContact) {
    tg.requestContact(() => poll());
  } else {
    poll();
  }
}

document.getElementById("menu-support").addEventListener("click", () => {
  const url = "https://t.me/animus_sh1";
  if (tg.openTelegramLink) {
    tg.openTelegramLink(url);
  } else {
    window.open(url, "_blank");
  }
});

// ---------- Подэкраны профиля: FAQ / Уведомления / Настройки ----------
const subscreen = document.getElementById("subscreen-overlay");
const subscreenTitle = document.getElementById("subscreen-title");
const subscreenBody = document.getElementById("subscreen-body");

let activeSubscreenRenderer = null;

function openSubscreen(titleKey, bodyHtml) {
  subscreenTitle.textContent = t(titleKey);
  subscreenBody.innerHTML = bodyHtml;
  subscreen.classList.remove("hidden");
}

document.getElementById("subscreen-back").addEventListener("click", () => {
  subscreen.classList.add("hidden");
  activeSubscreenRenderer = null;
});

// ---- FAQ ----
function renderFaqScreen() {
  activeSubscreenRenderer = renderFaqScreen;
  const items = t("faqItems");
  const html = items.map((item, i) => `
    <div class="faq-item" data-idx="${i}">
      <button class="faq-question" data-idx="${i}">
        <span>${item.q}</span>
        <span class="faq-arrow">▾</span>
      </button>
      <div class="faq-answer">${item.a}</div>
    </div>
  `).join("");
  openSubscreen("menuFaq", html);

  subscreenBody.querySelectorAll(".faq-question").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.closest(".faq-item").classList.toggle("open");
    });
  });
}

document.getElementById("menu-faq").addEventListener("click", renderFaqScreen);

// ---- Уведомления ----
const NOTIFICATION_TOGGLES = [
  { key: "orders", labelKey: "notifOrdersLabel", descKey: "notifOrdersDesc" },
  { key: "marketplace", labelKey: "notifMarketLabel", descKey: "notifMarketDesc" },
  { key: "news", labelKey: "notifNewsLabel", descKey: "notifNewsDesc" },
];

function getNotifPrefs() {
  try {
    return JSON.parse(localStorage.getItem("studhub_notif_prefs") || "{}");
  } catch (e) {
    return {};
  }
}

function setNotifPref(key, value) {
  const prefs = getNotifPrefs();
  prefs[key] = value;
  localStorage.setItem("studhub_notif_prefs", JSON.stringify(prefs));
}

function renderNotificationsScreen() {
  activeSubscreenRenderer = renderNotificationsScreen;
  const prefs = getNotifPrefs();
  const html = NOTIFICATION_TOGGLES.map((item) => {
    const checked = prefs[item.key] !== false; // по умолчанию включено
    return `
      <div class="settings-row">
        <div>
          <div class="settings-row-label">${t(item.labelKey)}</div>
          <div class="settings-row-desc">${t(item.descKey)}</div>
        </div>
        <label class="switch">
          <input type="checkbox" data-key="${item.key}" ${checked ? "checked" : ""}>
          <span class="switch-track"></span>
        </label>
      </div>
    `;
  }).join("");
  openSubscreen("menuNotifications", html);

  subscreenBody.querySelectorAll("input[type=checkbox]").forEach((input) => {
    input.addEventListener("change", () => setNotifPref(input.dataset.key, input.checked));
  });
}

document.getElementById("menu-notifications").addEventListener("click", renderNotificationsScreen);

// ---- Настройки ----
function renderSettingsScreen() {
  activeSubscreenRenderer = renderSettingsScreen;
  const html = `
    <div class="settings-row" id="settings-lang-row" style="cursor:pointer;">
      <div>
        <div class="settings-row-label">${t("settingsLanguage")}</div>
        <div class="settings-row-desc">${currentLang}</div>
      </div>
      <span class="profile-item-arrow">›</span>
    </div>
    <div class="settings-row" id="settings-share-row" style="cursor:pointer;">
      <div>
        <div class="settings-row-label">${t("settingsShare")}</div>
        <div class="settings-row-desc">${t("settingsShareDesc")}</div>
      </div>
      <span class="profile-item-arrow">›</span>
    </div>
    <div class="settings-info-row">StudHub · v1.0</div>
  `;
  openSubscreen("menuSettings", html);

  document.getElementById("settings-lang-row").addEventListener("click", () => {
    langOverlay.classList.remove("hidden");
  });
  document.getElementById("settings-share-row").addEventListener("click", () => {
    const botUrl = window.location.origin.replace(/^https?:\/\//, "https://t.me/");
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(t("settingsShareText"))}`;
    if (tg.openTelegramLink) {
      tg.openTelegramLink(shareUrl);
    } else {
      window.open(shareUrl, "_blank");
    }
  });
}

document.getElementById("menu-settings").addEventListener("click", renderSettingsScreen);

// ---------- Init ----------
applyTranslations();
setBannerVisible(true);

// Запрещаем выбор прошлой даты в поле "Показывать до"
const lfExpiresInput = document.getElementById("lf-expires");
if (lfExpiresInput) {
  lfExpiresInput.min = new Date().toISOString().slice(0, 10);
}
