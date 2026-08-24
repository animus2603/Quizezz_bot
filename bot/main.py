import asyncio
import logging

from bot.loader import bot, dp
from bot.handlers import start, payments, admin, profile


def setup_routers() -> None:
    # порядок важен: admin фильтрует по ADMIN_CHAT_ID, payments/profile — по "не ADMIN_CHAT_ID"
    dp.include_router(admin.router)
    dp.include_router(start.router)
    dp.include_router(payments.router)
    dp.include_router(profile.router)


async def start_polling() -> None:
    """Запускается как background task внутри FastAPI (см. api/main.py)."""
    setup_routers()
    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot)


async def _standalone() -> None:
    """Если хотите запустить бота отдельно от API — без Mini App это бессмысленно,
    но полезно для отладки хендлеров."""
    logging.basicConfig(level=logging.INFO)
    from database.engine import init_db
    await init_db()
    await start_polling()


if __name__ == "__main__":
    asyncio.run(_standalone())
