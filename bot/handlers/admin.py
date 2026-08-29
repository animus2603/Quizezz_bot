import asyncio

from aiogram import Router, F
from aiogram.filters import Command, StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import StatesGroup, State
from aiogram.types import CallbackQuery, Message
from sqlalchemy import select

from database.engine import async_session
from database.models import Order, OrderStatus, OrderType, User, Listing, ListingStatus, QuizCatalogItem
from database import crud
from config import ADMIN_CHAT_ID

router = Router(name="admin")
router.message.filter(F.chat.id == ADMIN_CHAT_ID)
router.callback_query.filter(F.message.chat.id == ADMIN_CHAT_ID)

REJECT_REASON_TIMEOUT = 180  # 3 минуты на причину отказа


class CompleteOrder(StatesGroup):
    waiting_result = State()


class RejectOrder(StatesGroup):
    waiting_reason = State()


class RejectListing(StatesGroup):
    waiting_reason = State()


async def _remove_processed_message(call: CallbackQuery) -> None:
    """Сразу после нажатия кнопки (подтвердить/отклонить) убираем сообщение,
    чтобы по нему нельзя было нажать повторно. Если удалить нельзя (например,
    прошло больше 48 часов) — хотя бы снимаем инлайн-кнопки."""
    try:
        await call.message.delete()
    except Exception:
        try:
            await call.message.edit_reply_markup(reply_markup=None)
        except Exception:
            pass


# ---------- Оплата заказов Quizizz ----------

@router.callback_query(F.data.startswith("order_confirm:"))
async def confirm_order(call: CallbackQuery):
    order_id = int(call.data.split(":")[1])
    async with async_session() as session:
        order = await crud.get_order(session, order_id)
        if not order:
            await call.answer("Заказ не найден", show_alert=True)
            return

        await _remove_processed_message(call)

        user_result = await session.execute(select(User).where(User.id == order.user_id))
        user = user_result.scalar_one()

        if order.order_type == OrderType.ready_quiz:
            item_result = await session.execute(
                select(QuizCatalogItem).where(QuizCatalogItem.id == order.catalog_item_id)
            )
            item = item_result.scalar_one()

            order = await crud.set_order_status(session, order, OrderStatus.sent)
            await call.bot.send_message(
                user.tg_id,
                f"✅ Оплата по заказу #{order.id} подтверждена!\nВаш тест «{item.title}»:\n{item.file_url}",
            )
        else:
            order = await crud.set_order_status(session, order, OrderStatus.in_progress)
            deadline_str = order.deadline.strftime("%d.%m.%Y %H:%M") if order.deadline else "—"
            await call.bot.send_message(
                user.tg_id,
                f"✅ Заказ #{order.id} принят!\n"
                f"Статус: <b>Принято</b> — будет готово в течение рабочего дня.\n"
                f"Дедлайн: {deadline_str}\n\n"
                f"Как только всё будет готово, мы пришлём сюда файл/ссылку.",
            )

    await call.answer("Подтверждено")


@router.callback_query(F.data.startswith("order_reject:"))
async def reject_order_start(call: CallbackQuery, state: FSMContext):
    order_id = int(call.data.split(":")[1])
    await _remove_processed_message(call)
    await state.update_data(order_id=order_id)
    await state.set_state(RejectOrder.waiting_reason)
    await call.answer()
    await call.message.answer(
        f"Напишите причину отказа по заказу #{order_id} — она сразу уйдёт студенту."
    )


@router.message(RejectOrder.waiting_reason)
async def reject_order_finish(message: Message, state: FSMContext):
    data = await state.get_data()
    order_id = data["order_id"]
    reason = message.text or "без указания причины"

    async with async_session() as session:
        order = await crud.get_order(session, order_id)
        if not order:
            await message.answer("Заказ не найден — возможно, уже обработан.")
            await state.clear()
            return

        user_result = await session.execute(select(User).where(User.id == order.user_id))
        user = user_result.scalar_one()

        order = await crud.set_order_status(session, order, OrderStatus.rejected)
        await message.bot.send_message(
            user.tg_id,
            f"❌ Заказ #{order.id} отклонён.\nПричина: {reason}\n\n"
            f"Если это ошибка — свяжитесь с оператором или оформите заказ заново.",
        )

    await state.clear()
    await message.answer(f"Готово — заказ #{order_id} отклонён, студент уведомлён.")


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

        await _remove_processed_message(call)

        listing = await crud.set_listing_status(session, listing, ListingStatus.approved)

        user_result = await session.execute(select(User).where(User.id == listing.seller_id))
        user = user_result.scalar_one()
        await call.bot.send_message(user.tg_id, f"✅ Ваше объявление «{listing.title}» опубликовано!")

    await call.answer("Опубликовано")


@router.callback_query(F.data.startswith("listing_reject:"))
async def reject_listing_start(call: CallbackQuery, state: FSMContext):
    listing_id = int(call.data.split(":")[1])
    await _remove_processed_message(call)
    await state.update_data(listing_id=listing_id)
    await state.set_state(RejectListing.waiting_reason)
    await call.answer()
    await call.message.answer(
        f"Напишите причину отказа по объявлению #{listing_id} — у вас есть {REJECT_REASON_TIMEOUT // 60} минуты. "
        f"Если не успеете — объявление отклонится автоматически без указания причины."
    )
    asyncio.create_task(_listing_reject_timeout(state, listing_id, call.bot))


async def _listing_reject_timeout(state: FSMContext, listing_id: int, bot) -> None:
    """Если админ не написал причину за REJECT_REASON_TIMEOUT секунд — отклоняем
    объявление автоматически, чтобы студент не завис в ожидании."""
    await asyncio.sleep(REJECT_REASON_TIMEOUT)
    data = await state.get_data()
    if data.get("listing_id") != listing_id:
        return  # админ уже ответил, или состояние сменилось — ничего не делаем

    async with async_session() as session:
        listing = await crud.get_listing(session, listing_id)
        if not listing or listing.status != ListingStatus.pending:
            return
        listing = await crud.set_listing_status(session, listing, ListingStatus.rejected)

        user_result = await session.execute(select(User).where(User.id == listing.seller_id))
        user = user_result.scalar_one()
        await bot.send_message(
            user.tg_id,
            f"❌ Ваше объявление «{listing.title}» отклонено модератором (без указания причины).",
        )
        await bot.send_message(
            ADMIN_CHAT_ID,
            f"⏱ Время на причину отказа по объявлению #{listing_id} истекло — отклонено автоматически.",
        )

    await state.clear()


@router.message(RejectListing.waiting_reason)
async def reject_listing_finish(message: Message, state: FSMContext):
    data = await state.get_data()
    listing_id = data.get("listing_id")
    if listing_id is None:
        return
    reason = message.text or "без указания причины"

    async with async_session() as session:
        listing = await crud.get_listing(session, listing_id)
        if not listing:
            await message.answer("Объявление не найдено — возможно, уже обработано.")
            await state.clear()
            return

        listing = await crud.set_listing_status(session, listing, ListingStatus.rejected)

        user_result = await session.execute(select(User).where(User.id == listing.seller_id))
        user = user_result.scalar_one()
        await message.bot.send_message(
            user.tg_id,
            f"❌ Ваше объявление «{listing.title}» отклонено.\nПричина: {reason}",
        )

    await state.clear()
    await message.answer(f"Готово — объявление #{listing_id} отклонено, продавец уведомлён.")
