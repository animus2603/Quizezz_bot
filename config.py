import os
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN", "")
BOT_USERNAME = os.getenv("BOT_USERNAME", "")  # без @, для реферальных ссылок t.me/<username>?start=ref_...
ADMIN_CHAT_ID = int(os.getenv("ADMIN_CHAT_ID", "0"))
WEBAPP_URL = os.getenv("WEBAPP_URL", "http://localhost:8000/webapp/index.html")
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000/api")

KASPI_PHONE = os.getenv("KASPI_PHONE", "+7 700 000 00 00")
KASPI_NAME = os.getenv("KASPI_NAME", "Имя Фамилия")

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./db/app.db")

# Фиксированные цены (тенге)
PRICE_READY_QUIZ = 3000
PRICE_CUSTOM_QUIZ = 5000
