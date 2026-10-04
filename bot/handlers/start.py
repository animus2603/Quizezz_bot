from aiogram import Router, F
from aiogram.filters import CommandStart, CommandObject, Command
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

from config import WEBAPP_URL, ADMIN_CHAT_ID
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
        existing = await crud.get_user_by_tg_id(session, message.from_user.id)
        user = await crud.get_or_create_user(
            session, message.from_user.id, message.from_user.username, message.from_user.full_name,
            referred_by=referred_by,
        )
        # баллы начисляем только один раз — если пользователь только что создан по этой ссылке
        if existing is None and referred_by and user.referred_by == referred_by:
            await crud.award_referral_points(session, referred_by)

    kb = InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(text="🚀 Открыть Bereket", web_app=WebAppInfo(url=WEBAPP_URL))
    ]])
    await message.answer(
        "🎓 <b>Добро пожаловать в Bereket!</b>\n\n"
        "Твой университетский помощник — всё в одном месте:\n\n"
        "📚 <b>Готовые тесты</b> — покупай Quizizz и экономь время\n"
        "✍️ <b>Индивидуальные заказы</b> — мы решим за тебя\n"
        "🛒 <b>Маркетплейс</b> — продавай и покупай учебное и товары\n"
        "💎 <b>Бонусы</b> — приглашай друзей и получай баллы\n\n"
        "Жми кнопку ниже и начни прямо сейчас! 👇",
        reply_markup=kb,
        parse_mode="HTML"
    )


@router.message(Command("administration"))
async def administration_access_denied(message: Message):
    """Красивое сообщение для не-админов при попытке доступа к админ-панели"""
    if message.chat.id == ADMIN_CHAT_ID:
        # Если это админ, он обрабатывается в admin.py
        return

    await message.answer(
        "🚫 <b>Доступ запрещён</b>\n\n"
        "Эта команда доступна только администраторам Bereket.\n\n"
        "🤔 <b>Что вы хотели сделать?</b>\n\n"
        "• <b>Купить тест</b> — используйте мини-приложение (кнопка ниже)\n"
        "• <b>Разместить объявление</b> — мини-приложение → Разместить\n"
        "• <b>Поддержка</b> — мини-приложение → Профиль → Поддержка\n\n"
        "Если у вас есть вопросы — напишите нам:\n"
        "<a href=\"https://wa.me/77003626026\">📱 WhatsApp</a>\n"
        "<a href=\"https://www.instagram.com/bereket_app.sh\">📷 Instagram</a>\n"
        "<a href=\"https://www.tiktok.com/@bereket_app\">🎵 TikTok</a>\n"
        "<a href=\"mailto:rozybayewdemon@gmail.com\">✉️ Email</a>\n\n"
        "Жмите кнопку ниже для работы с приложением 👇",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[[
            InlineKeyboardButton(text="🚀 Открыть Bereket", web_app=WebAppInfo(url=WEBAPP_URL))
        ]]),
        parse_mode="HTML",
        disable_web_page_preview=True
    )
