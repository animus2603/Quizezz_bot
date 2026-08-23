# StudHub — Telegram Mini App (Quizizz + Маркетплейс)

## Что уже готово (Этап 0-1)

- Структура проекта: бот (aiogram3) + API (FastAPI) + Mini App (HTML/JS) в одном процессе.
- БД (SQLite, SQLAlchemy async): пользователи, каталог тестов, заказы, объявления.
- `/start` открывает Mini App.
- Каталог готовых тестов (3000₸) — покупка создаёт заказ.
- Заказ индивидуального теста (5000₸) с дедлайном и комментарием.
- Оплата: бот показывает реквизиты Kaspi, студент присылает скрин чека боту,
  админ получает уведомление с кнопками ✅/❌.
- После подтверждения: готовый тест — файл сразу уходит студенту;
  индивидуальный — заказ переходит в "в работе", админ завершает через `/complete <id>`.
- Маркетплейс: создание объявления → модерация админом (✅/❌) → публикация в ленте.

## Чего пока нет (следующие этапы)

- Реквизиты Kaspi нужно **вывести в текст /start или отдельную команду** — сейчас функция
  `kaspi_requisites_text()` в `bot/notify.py` написана, но не подключена к сообщению после
  создания заказа (это следующий шаг — можно дернуть API из webapp, показать реквизиты
  прямо в интерфейсе, либо отправить сообщение из бота сразу после создания заказа через API).
- Экран "Мои заказы" во вкладке "Мои" — пока заглушка.
- Статистика/финансы для админа.
- Постраничная загрузка/пагинация ленты объявлений.
- Загрузка фото в объявления (модель это поддерживает, форма — ещё нет).
- Миграции (Alembic) — сейчас таблицы просто создаются при старте.
- Автонапоминания админу о горящих дедлайнах custom-заказов.

## Запуск локально

```bash
cd Quizezz_bot
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# заполните BOT_TOKEN (от @BotFather), ADMIN_CHAT_ID, KASPI_PHONE, KASPI_NAME

uvicorn api.main:app --reload --port 8000
```

Бот и API стартуют в одном процессе (бот поллингом — фоновой задачей внутри FastAPI).

## Чтобы открыть Mini App из Telegram

Telegram требует HTTPS-адрес для Web App. Для локальной разработки:

```bash
# в отдельном терминале
ngrok http 8000
```

Скопируйте выданный `https://...ngrok-free.app` в `.env`:
```
WEBAPP_URL=https://xxxx.ngrok-free.app/webapp/index.html
```
Перезапустите `uvicorn`, затем откройте бота в Telegram и нажмите /start.

## Как узнать ADMIN_CHAT_ID

Напишите боту `@userinfobot` — он покажет ваш `id`. Для группы админов —
добавьте бота в группу и используйте отрицательный ID группы.

## Структура проекта

```
Quizezz_bot/
├── api/                # FastAPI: REST для Mini App
│   ├── main.py
│   ├── schemas.py
│   └── routers/
│       ├── quiz.py
│       └── marketplace.py
├── bot/                # aiogram 3
│   ├── loader.py       # общий Bot/Dispatcher
│   ├── main.py         # регистрация роутеров, запуск polling
│   ├── notify.py       # уведомления админу
│   └── handlers/
│       ├── start.py
│       ├── payments.py # приём чеков от студентов
│       └── admin.py    # подтверждение оплат, модерация, /complete
├── database/           # SQLAlchemy модели + CRUD
├── webapp/             # Mini App (без сборки, чистый HTML/JS)
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
├── db/                 # тут появится app.db (SQLite)
├── config.py
├── requirements.txt
└── .env.example
```

## Деплой (когда дойдём)

Проще всего — VPS (Timeweb/Selectel/DO) + Nginx + systemd, или Railway/Render
для быстрого MVP-хостинга. Тогда `WEBAPP_URL` и `API_BASE_URL` укажут на
реальный домен вместо ngrok.
