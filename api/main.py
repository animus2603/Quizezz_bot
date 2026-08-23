import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database.engine import init_db
from api.routers import quiz, marketplace
from bot.main import start_polling

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    bot_task = asyncio.create_task(start_polling())
    yield
    bot_task.cancel()


app = FastAPI(title="Quizizz & Marketplace Bot API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # для MVP; на проде сузить до домена Mini App
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(quiz.router, prefix="/api")
app.include_router(marketplace.router, prefix="/api")

# отдаём статику Mini App прямо с бэкенда (проще для MVP, чем отдельный хостинг)
app.mount("/webapp", StaticFiles(directory="webapp", html=True), name="webapp")


@app.get("/")
async def root():
    return {"status": "ok", "webapp": "/webapp/index.html"}
