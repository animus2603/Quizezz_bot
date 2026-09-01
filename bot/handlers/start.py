from aiogram import Router, F
from aiogram.filters import CommandStart, CommandObject
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

from config import WEBAPP_URL
from database.engine import async_session
from database import crud

router = Router(name="start")


@router.message(CommandStart())
async def cmd_start(message: Message, command: CommandObject):
    # Реферальная ссылка: t.me/<bot>?start=ref_<tg_id пригласившего>
    referred_by = None
    if command.args and command.args.startswith("ref_"):
        try:
            candidate = int(command.args.removeprefix("ref_"))
            if candidate != message.from_user.id:
                referred_by = candidate
        except ValueError:
            pass

    async with async_session() as session:
        await crud.get_or_create_user(
            session, message.from_user.id, message.from_user.username, message.from_user.full_name,
            referred_by=referred_by,
        )

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
