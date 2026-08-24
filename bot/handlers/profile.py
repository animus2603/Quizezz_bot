from aiogram import Router, F
from aiogram.types import Message

from database.engine import async_session
from database import crud
from config import ADMIN_CHAT_ID

router = Router(name="profile")


@router.message(F.contact, F.chat.id != ADMIN_CHAT_ID)
async def handle_contact(message: Message):
    """Студент поделился контактом (кнопка «Привязать номер» в Mini App вызывает tg.requestContact())."""
    contact = message.contact
    if contact.user_id != message.from_user.id:
        # прислали чужой контакт — не привязываем
        return

    async with async_session() as session:
        user = await crud.get_or_create_user(
            session, message.from_user.id, message.from_user.username, message.from_user.full_name
        )
        await crud.set_user_phone(session, user, contact.phone_number)

    await message.answer("✅ Номер телефона привязан к вашему профилю.")
