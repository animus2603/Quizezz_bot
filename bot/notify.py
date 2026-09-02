import json

from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.exceptions import TelegramAPIError

from bot.loader import bot
from config import ADMIN_CHAT_ID, KASPI_PHONE, KASPI_NAME
from database.models import Order, User, Listing

ORDER_TYPE_LABELS = {
    "ready_quiz": "Готовый тест (3000₸)",
    "custom_quiz": "Индивидуальный заказ (5000₸)",
}


def order_action_keyboard(order_id: int) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(text="✅ Подтвердить", callback_data=f"order_confirm:{order_id}"),
        InlineKeyboardButton(text="❌ Отказать", callback_data=f"order_reject:{order_id}"),
    ]])


async def notify_admin_new_order(order: Order, user: User, kind: str, subject: str = "") -> None:
    """Уведомление админу о новом заказе — сразу с кнопками подтвердить/отказать."""
    if not ADMIN_CHAT_ID:
        return

    label = ORDER_TYPE_LABELS.get(kind, kind)
    text = (
        f"🆕 <b>Новый заказ #{order.id}</b>\n"
        f"Тип: {label}\n"
    )
    if subject:
        text += f"Предмет/тест: {subject}\n"
    text += (
        f"Студент: {user.full_name or ''} (@{user.username or '—'}, id {user.tg_id})\n"
        f"Статус: ожидает оплаты\n"
    )
    if order.deadline:
        text += f"Дедлайн: {order.deadline.strftime('%d.%m.%Y %H:%M')}\n"
    if order.comment:
        text += f"Комментарий: {order.comment}\n"

    try:
        await bot.send_message(ADMIN_CHAT_ID, text, reply_markup=order_action_keyboard(order.id))
    except TelegramAPIError:
        pass


async def notify_client_new_order(order: Order, user: User, kind: str, subject: str = "") -> None:
    """Клиенту сразу после оформления заказа: номер, тип, предмет, статус + реквизиты Kaspi."""
    label = ORDER_TYPE_LABELS.get(kind, kind)
    text = (
        f"🧾 <b>Заказ #{order.id} создан</b>\n"
        f"Тип: {label}\n"
    )
    if subject:
        text += f"Предмет/тест: {subject}\n"
    text += f"Статус: ожидает оплаты\n\n"
    text += kaspi_requisites_text(order.price)

    try:
        await bot.send_message(user.tg_id, text)
    except TelegramAPIError:
        pass


async def notify_admin_receipt(order: Order, user: User) -> None:
    """Когда студент прислал скрин чека — шлём его админу с кнопками подтвердить/отклонить."""
    if not ADMIN_CHAT_ID:
        return

    caption = (
        f"💳 Чек по заказу #{order.id}\n"
        f"Студент: @{user.username or '—'} (id {user.tg_id})\n"
        f"Сумма: {order.price}₸"
    )

    try:
        await bot.send_photo(
            ADMIN_CHAT_ID, order.receipt_file_id, caption=caption,
            reply_markup=order_action_keyboard(order.id),
        )
    except TelegramAPIError:
        pass


async def notify_admin_new_listing(listing: Listing, user: User) -> None:
    if not ADMIN_CHAT_ID:
        return

    kb = InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(text="✅ Опубликовать", callback_data=f"listing_approve:{listing.id}"),
        InlineKeyboardButton(text="❌ Отклонить", callback_data=f"listing_reject:{listing.id}"),
    ]])

    photo_urls = []
    if listing.photo_urls:
        try:
            photo_urls = json.loads(listing.photo_urls)
        except (ValueError, TypeError):
            photo_urls = []

    photos_note = f"\n📷 Фото: {len(photo_urls)} шт." if len(photo_urls) > 1 else ""

    text = (
        f"📢 <b>Новое объявление #{listing.id}</b>\n"
        f"Категория: {listing.category.value}\n"
        f"{listing.title}\n"
        f"Цена: {listing.price or '—'}₸\n"
        f"Продавец: @{user.username or '—'}\n"
        f"Контакт: {listing.contact}"
        f"{photos_note}"
    )

    try:
        if photo_urls:
            await bot.send_photo(ADMIN_CHAT_ID, photo_urls[0], caption=text, reply_markup=kb)
        elif listing.photo_file_id:
            await bot.send_photo(ADMIN_CHAT_ID, listing.photo_file_id, caption=text, reply_markup=kb)
        else:
            await bot.send_message(ADMIN_CHAT_ID, text, reply_markup=kb)
    except TelegramAPIError:
        pass


async def notify_client_listing_submitted(listing: Listing, user: User) -> None:
    """Клиенту сразу после отправки объявления — подтверждение, что оно ушло на модерацию."""
    text = (
        f"📤 <b>Объявление отправлено на модерацию</b>\n"
        f"{listing.title}\n"
        f"Как только администратор проверит — вам придёт уведомление."
    )
    try:
        await bot.send_message(user.tg_id, text)
    except TelegramAPIError:
        pass


async def notify_admin_refund_needed(order: Order, user: User) -> None:
    """Клиент отменил уже оплаченный (принятый в работу) заказ — админу нужно вручную вернуть деньги через Kaspi."""
    if not ADMIN_CHAT_ID:
        return
    text = (
        f"💸 <b>Требуется возврат денег по заказу #{order.id}</b>\n"
        f"Студент: {user.full_name or ''} (@{user.username or '—'}, id {user.tg_id})\n"
        f"Сумма: {order.price}₸\n"
        f"Заказ отменён клиентом в течение окна отмены (заказ был уже оплачен и принят в работу) — "
        f"верните деньги на Kaspi вручную."
    )
    try:
        await bot.send_message(ADMIN_CHAT_ID, text)
    except TelegramAPIError:
        pass


def kaspi_requisites_text(amount: int) -> str:
    return (
        f"Переведите <b>{amount}₸</b> на Kaspi:\n"
        f"📱 {KASPI_PHONE}\n"
        f"👤 {KASPI_NAME}\n\n"
        f"После перевода пришлите сюда скриншот чека одним сообщением."
    )
