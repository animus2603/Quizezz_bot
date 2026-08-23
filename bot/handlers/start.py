from aiogram import Router, F
from aiogram.filters import CommandStart
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

from config import WEBAPP_URL

router = Router(name="start")


@router.message(CommandStart())
async def cmd_start(message: Message):
    kb = InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(text="🚀 Открыть приложение", web_app=WebAppInfo(url=WEBAPP_URL))
    ]])
    await message.answer(
        "Привет! 👋\n\n"
        "Здесь можно:\n"
        "📚 Купить готовый Quizizz-тест или заказать индивидуальный\n"
        "🛒 Разместить или найти объявление на маркетплейсе\n\n"
        "Жми кнопку ниже:",
        reply_markup=kb,
    )
