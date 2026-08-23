from aiogram import Router, F
from aiogram.filters import Command, StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import StatesGroup, State
from aiogram.types import CallbackQuery, Message
from sqlalchemy import select

from database.engine import async_session
from database.models import Order, OrderStatus, OrderType, User, Listing, ListingStatus
from database import crud
from config import ADMIN_CHAT_ID

router = Router(name="admin")
router.message.filter(F.chat.id == ADMIN_CHAT_ID)
router.callback_query.filter(F.message.chat.id == ADMIN_CHAT_ID)


class CompleteOrder(StatesGroup):
    waiting_result = State()


# ---------- Оплата заказов Quizizz ----------

@router.callback_query(F.data.startswith("order_confirm:"))
async def confirm_order(call: CallbackQuery):
    order_id = int(call.data.split(":")[1])
    async with async_session() as session:
        order = await crud.get_order(session, order_id)
        if not order:
            await call.answer("Заказ не найден", show_alert=True)
            return

        user_result = await session.execute(select(User).where(User.id == order.user_id))
        user = user_result.scalar_one()

        if order.order_type == OrderType.ready_quiz:
            catalog_result = await session.execute(
                select(Order.catalog_item_id).where(Order.id == order.id)
            )
            item_id = catalog_result.scalar_one()
            from database.models import QuizCatalogItem
            item_result = await session.execute(select(QuizCatalogItem).where(QuizCatalogItem.id == item_id))
            item = item_result.scalar_one()

            order = await crud.set_order_status(session, order, OrderStatus.sent)
            await call.bot.send_message(
                user.tg_id,
                f"✅ Оплата подтверждена!\nВаш тест «{item.title}»:\n{item.file_url}",
            )
            await call.message.edit_caption(caption=call.message.caption + "\n\n✅ ОПЛАЧЕНО, файл отправлен студенту")
        else:
            order = await crud.set_order_status(session, order, OrderStatus.in_progress)
            deadline_str = order.deadline.strftime("%d.%m.%Y %H:%M") if order.deadline else "—"
            await call.bot.send_message(
                user.tg_id,
                f"✅ Оплата подтверждена! Ваш индивидуальный заказ #{order.id} взят в работу.\n"
                f"Дедлайн: {deadline_str}",
            )
            await call.message.edit_caption(
                caption=call.message.caption + f"\n\n✅ ОПЛАЧЕНО, в работе. Когда закончите: /complete {order.id}"
            )

    await call.answer("Подтверждено")


@router.callback_query(F.data.startswith("order_reject:"))
async def reject_order(call: CallbackQuery):
    order_id = int(call.data.split(":")[1])
    async with async_session() as session:
        order = await crud.get_order(session, order_id)
        if not order:
            await call.answer("Заказ не найден", show_alert=True)
            return
        user_result = await session.execute(select(User).where(User.id == order.user_id))
        user = user_result.scalar_one()

        order = await crud.set_order_status(session, order, OrderStatus.rejected)
        await call.bot.send_message(
            user.tg_id,
            f"❌ Чек по заказу #{order.id} не подтверждён. Свяжитесь с оператором или пришлите чек ещё раз.",
        )
        await call.message.edit_caption(caption=call.message.caption + "\n\n❌ ОТКЛОНЕНО")

    await call.answer("Отклонено")


@router.message(Command("complete"), StateFilter(None))
async def start_complete_order(message: Message, state: FSMContext):
    parts = message.text.split()
    if len(parts) != 2 or not parts[1].isdigit():
        await message.answer("Использование: /complete <order_id>")
        return

    order_id = int(parts[1])
    async with async_session() as session:
        order = await crud.get_order(session, order_id)
        if not order or order.order_type != OrderType.custom_quiz:
            await message.answer("Индивидуальный заказ с таким ID не найден.")
            return

    await state.update_data(order_id=order_id)
    await state.set_state(CompleteOrder.waiting_result)
    await message.answer(f"Пришлите файл/ссылку с готовым результатом по заказу #{order_id}.")


@router.message(CompleteOrder.waiting_result)
async def finish_complete_order(message: Message, state: FSMContext):
    data = await state.get_data()
    order_id = data["order_id"]

    async with async_session() as session:
        order = await crud.get_order(session, order_id)
        user_result = await session.execute(select(User).where(User.id == order.user_id))
        user = user_result.scalar_one()

        order = await crud.set_order_status(session, order, OrderStatus.done)

        if message.document:
            await message.bot.send_document(
                user.tg_id, message.document.file_id,
                caption=f"✅ Ваш заказ #{order_id} готов!",
            )
        else:
            await message.bot.send_message(user.tg_id, f"✅ Ваш заказ #{order_id} готов!\n{message.text}")

        order = await crud.set_order_status(session, order, OrderStatus.sent)

    await state.clear()
    await message.answer(f"Заказ #{order_id} отмечен как отправлен студенту.")


# ---------- Модерация маркетплейса ----------

@router.callback_query(F.data.startswith("listing_approve:"))
async def approve_listing(call: CallbackQuery):
    listing_id = int(call.data.split(":")[1])
    async with async_session() as session:
        listing = await crud.get_listing(session, listing_id)
        if not listing:
            await call.answer("Объявление не найдено", show_alert=True)
            return
        listing = await crud.set_listing_status(session, listing, ListingStatus.approved)

        user_result = await session.execute(select(User).where(User.id == listing.seller_id))
        user = user_result.scalar_one()
        await call.bot.send_message(user.tg_id, f"✅ Ваше объявление «{listing.title}» опубликовано!")

    if call.message.caption:
        await call.message.edit_caption(caption=call.message.caption + "\n\n✅ ОПУБЛИКОВАНО")
    else:
        await call.message.edit_text(call.message.text + "\n\n✅ ОПУБЛИКОВАНО")
    await call.answer("Опубликовано")


@router.callback_query(F.data.startswith("listing_reject:"))
async def reject_listing(call: CallbackQuery):
    listing_id = int(call.data.split(":")[1])
    async with async_session() as session:
        listing = await crud.get_listing(session, listing_id)
        if not listing:
            await call.answer("Объявление не найдено", show_alert=True)
            return
        listing = await crud.set_listing_status(session, listing, ListingStatus.rejected)

        user_result = await session.execute(select(User).where(User.id == listing.seller_id))
        user = user_result.scalar_one()
        await call.bot.send_message(user.tg_id, f"❌ Ваше объявление «{listing.title}» отклонено модератором.")

    if call.message.caption:
        await call.message.edit_caption(caption=call.message.caption + "\n\n❌ ОТКЛОНЕНО")
    else:
        await call.message.edit_text(call.message.text + "\n\n❌ ОТКЛОНЕНО")
    await call.answer("Отклонено")
