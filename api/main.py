import asyncio
import logging
import sys
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database.engine import init_db
from api.routers import quiz, marketplace, users, uploads, admin
from bot.main import start_polling

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

Path("uploads").mkdir(exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Запуск приложения...")
    await init_db()
    logger.info("База данных инициализирована")
    bot_task = asyncio.create_task(start_polling())
    yield
    logger.info("Остановка приложения...")
    bot_task.cancel()
    logger.info("Приложение остановлено")


app = FastAPI(title="Quizizz & Marketplace Bot API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # для MVP; на проде сузить до домена Mini App
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(quiz.router, prefix="/api")
app.include_router(marketplace.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(uploads.router, prefix="/api")
app.include_router(admin.router, prefix="/api/admin")


@app.get("/health")
async def health_check():
    """Health check endpoint для мониторинга"""
    return {
        "status": "healthy",
        "service": "Bereket API",
        "version": "1.0.0"
    }

# отдаём статику Mini App прямо с бэкенда (проще для MVP, чем отдельный хостинг)
app.mount("/webapp", StaticFiles(directory="webapp", html=True), name="webapp")
app.mount("/admin", StaticFiles(directory="admin", html=True), name="admin")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.get("/")
async def root():
    return {"status": "ok", "webapp": "/webapp/index.html"}
