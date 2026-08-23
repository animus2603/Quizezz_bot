from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.exceptions import TelegramAPIError

from bot.loader import bot
from config import ADMIN_CHAT_ID, KASPI_PHONE, KASPI_NAME
from database.models import Order, User, Listing


async def notify_admin_new_order(order: Order, user: User, kind: str) -> None:
    """Уведомление админу о новом заказе (ждём оплату — реквизиты уже видны пользователю в WebApp)."""
    if not ADMIN_CHAT_ID:
        return

    label = "Готовый тест (3000₸)" if kind == "ready_quiz" else "Индивидуальный заказ (5000₸)"
    text = (
        f"🆕 <b>Новый заказ #{order.id}</b>\n"
        f"Тип: {label}\n"
        f"Студент: {user.full_name or ''} (@{user.username or '—'}, id {user.tg_id})\n"
        f"Статус: ожидает оплаты (Kaspi)\n"
    )
    if order.deadline:
        text += f"Дедлайн: {order.deadline.strftime('%d.%m.%Y %H:%M')}\n"
    if order.comment:
        text += f"Комментарий: {order.comment}\n"

    try:
        await bot.send_message(ADMIN_CHAT_ID, text)
    except TelegramAPIError:
        pass


async def notify_admin_receipt(order: Order, user: User) -> None:
    """Когда студент прислал скрин чека — шлём его админу с кнопками подтвердить/отклонить."""
    if not ADMIN_CHAT_ID:
        return

    kb = InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(text="✅ Подтвердить оплату", callback_data=f"order_confirm:{order.id}"),
        InlineKeyboardButton(text="❌ Отклонить", callback_data=f"order_reject:{order.id}"),
    ]])

    caption = (
        f"💳 Чек по заказу #{order.id}\n"
        f"Студент: @{user.username or '—'} (id {user.tg_id})\n"
        f"Сумма: {order.price}₸"
    )

    try:
        await bot.send_photo(ADMIN_CHAT_ID, order.receipt_file_id, caption=caption, reply_markup=kb)
    except TelegramAPIError:
        pass


async def notify_admin_new_listing(listing: Listing, user: User) -> None:
    if not ADMIN_CHAT_ID:
        return

    kb = InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(text="✅ Опубликовать", callback_data=f"listing_approve:{listing.id}"),
        InlineKeyboardButton(text="❌ Отклонить", callback_data=f"listing_reject:{listing.id}"),
    ]])

    text = (
        f"📢 <b>Новое объявление #{listing.id}</b>\n"
        f"Категория: {listing.category.value}\n"
        f"{listing.title}\n"
        f"Цена: {listing.price or '—'}₸\n"
        f"Продавец: @{user.username or '—'}\n"
        f"Контакт: {listing.contact}"
    )

    try:
        if listing.photo_file_id:
            await bot.send_photo(ADMIN_CHAT_ID, listing.photo_file_id, caption=text, reply_markup=kb)
        else:
            await bot.send_message(ADMIN_CHAT_ID, text, reply_markup=kb)
    except TelegramAPIError:
        pass


def kaspi_requisites_text(amount: int) -> str:
    return (
        f"Переведите <b>{amount}₸</b> на Kaspi:\n"
        f"📱 {KASPI_PHONE}\n"
        f"👤 {KASPI_NAME}\n\n"
        f"После перевода пришлите сюда скриншот чека одним сообщением."
    )
