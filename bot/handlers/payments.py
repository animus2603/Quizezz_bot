from aiogram import Router, F
from aiogram.types import Message
from sqlalchemy import select

from database.engine import async_session
from database.models import Order, OrderStatus, User
from database import crud
from bot.notify import notify_admin_receipt
from config import ADMIN_CHAT_ID

router = Router(name="payments")


@router.message(F.photo, F.chat.id != ADMIN_CHAT_ID)
async def handle_receipt_photo(message: Message):
    """Студент прислал скрин чека. Ищем его последний заказ, ожидающий оплаты, и прикрепляем чек."""
    async with async_session() as session:
        user_result = await session.execute(select(User).where(User.tg_id == message.from_user.id))
        user = user_result.scalar_one_or_none()
        if not user:
            await message.answer("Не нашёл активный заказ. Сначала оформите заказ в приложении.")
            return

        order_result = await session.execute(
            select(Order)
            .where(Order.user_id == user.id, Order.status == OrderStatus.awaiting_payment)
            .order_by(Order.created_at.desc())
        )
        order = order_result.scalars().first()

        if not order:
            await message.answer(
                "Не нашёл заказ, ожидающий оплаты. Если вы уже отправляли чек — он на проверке у оператора."
            )
            return

        file_id = message.photo[-1].file_id
        order = await crud.attach_receipt(session, order, file_id)

        await message.answer(
            f"✅ Чек по заказу #{order.id} получен и отправлен на проверку.\n"
            f"Как только оператор подтвердит оплату — вы получите уведомление."
        )
        await notify_admin_receipt(order, user)
