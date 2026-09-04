import datetime as dt
import json

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import (
    User, QuizCatalogItem, Order, OrderType, OrderStatus,
    Listing, ListingCategory, ListingStatus, ListingComment,
)


async def get_user_by_tg_id(session: AsyncSession, tg_id: int) -> User | None:
    result = await session.execute(select(User).where(User.tg_id == tg_id))
    return result.scalar_one_or_none()


async def set_user_phone(session: AsyncSession, user: User, phone: str) -> User:
    user.phone = phone
    await session.commit()
    await session.refresh(user)
    return user


async def get_user_orders(session: AsyncSession, user_id: int) -> list[Order]:
    result = await session.execute(
        select(Order).where(Order.user_id == user_id).order_by(Order.created_at.desc())
    )
    return list(result.scalars().all())


async def get_user_listings(session: AsyncSession, user_id: int) -> list[Listing]:
    result = await session.execute(
        select(Listing).where(Listing.seller_id == user_id).order_by(Listing.created_at.desc())
    )
    return list(result.scalars().all())


async def get_or_create_user(
    session: AsyncSession, tg_id: int, username: str | None, full_name: str | None, referred_by: int | None = None
) -> User:
    result = await session.execute(select(User).where(User.tg_id == tg_id))
    user = result.scalar_one_or_none()
    if user:
        return user
    user = User(tg_id=tg_id, username=username, full_name=full_name, referred_by=referred_by)
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


async def count_referrals(session: AsyncSession, tg_id: int) -> int:
    result = await session.execute(select(User).where(User.referred_by == tg_id))
    return len(result.scalars().all())


async def get_active_catalog(session: AsyncSession) -> list[QuizCatalogItem]:
    result = await session.execute(
        select(QuizCatalogItem).where(QuizCatalogItem.is_active == True)  # noqa: E712
    )
    return list(result.scalars().all())


async def create_ready_quiz_order(session: AsyncSession, user_id: int, catalog_item: QuizCatalogItem) -> Order:
    order = Order(
        user_id=user_id,
        order_type=OrderType.ready_quiz,
        status=OrderStatus.awaiting_payment,
        catalog_item_id=catalog_item.id,
        price=catalog_item.price,
    )
    session.add(order)
    await session.commit()
    await session.refresh(order)
    return order


async def create_custom_quiz_order(
    session: AsyncSession,
    user_id: int,
    questions_file_url: str | None,
    deadline: dt.datetime | None,
    comment: str | None,
    price: int,
) -> Order:
    order = Order(
        user_id=user_id,
        order_type=OrderType.custom_quiz,
        status=OrderStatus.awaiting_payment,
        questions_file_url=questions_file_url,
        deadline=deadline,
        comment=comment,
        price=price,
    )
    session.add(order)
    await session.commit()
    await session.refresh(order)
    return order


async def get_order(session: AsyncSession, order_id: int) -> Order | None:
    result = await session.execute(select(Order).where(Order.id == order_id))
    return result.scalar_one_or_none()


async def attach_receipt(session: AsyncSession, order: Order, file_id: str) -> Order:
    order.receipt_file_id = file_id
    order.status = OrderStatus.payment_review
    await session.commit()
    await session.refresh(order)
    return order


async def set_order_status(session: AsyncSession, order: Order, status: OrderStatus) -> Order:
    order.status = status
    await session.commit()
    await session.refresh(order)
    return order


async def reject_order_with_reason(session: AsyncSession, order: Order, reason: str) -> Order:
    order.status = OrderStatus.rejected
    order.rejection_reason = reason
    await session.commit()
    await session.refresh(order)
    return order


CANCEL_WINDOW_READY_SECONDS = 3600     # 1 час — готовые тесты, пока не оплачены
CANCEL_WINDOW_CUSTOM_SECONDS = 10800   # 3 часа — индивидуальные заказы, даже если уже оплачены


def order_cancel_seconds_left(order: Order) -> int:
    if order.order_type == OrderType.custom_quiz:
        # индивидуальный заказ можно отменить (с возвратом денег), пока ждёт оплаты
        # ИЛИ уже взят в работу — в течение 3 часов с момента создания заказа
        allowed_statuses = (OrderStatus.awaiting_payment, OrderStatus.in_progress)
        window = CANCEL_WINDOW_CUSTOM_SECONDS
    else:
        # готовый тест — отменить можно, только пока не оплачен (файл после оплаты уходит сразу)
        allowed_statuses = (OrderStatus.awaiting_payment,)
        window = CANCEL_WINDOW_READY_SECONDS

    if order.status not in allowed_statuses:
        return 0
    elapsed = (dt.datetime.utcnow() - order.created_at).total_seconds()
    return max(0, int(window - elapsed))


async def cancel_order(session: AsyncSession, order: Order) -> Order:
    was_in_progress = order.status == OrderStatus.in_progress
    order.status = OrderStatus.cancelled
    await session.commit()
    await session.refresh(order)
    return order, was_in_progress


async def create_listing(
    session: AsyncSession,
    seller_id: int,
    category: ListingCategory,
    title: str,
    description: str | None,
    price: int | None,
    photo_file_id: str | None,
    contact: str,
    subcategory: str | None = None,
    course: str | None = None,
    group_name: str | None = None,
    faculty: str | None = None,
    department: str | None = None,
    subject: str | None = None,
    attachment_url: str | None = None,
    photo_urls: list[str] | None = None,
    expires_at: dt.datetime | None = None,
) -> Listing:
    listing = Listing(
        seller_id=seller_id,
        category=category,
        title=title,
        description=description,
        price=price,
        photo_file_id=photo_file_id,
        attachment_url=attachment_url,
        photo_urls=json.dumps(photo_urls) if photo_urls else None,
        contact=contact,
        subcategory=subcategory,
        course=course,
        group_name=group_name,
        faculty=faculty,
        department=department,
        subject=subject,
        status=ListingStatus.pending,
        expires_at=expires_at,
    )
    session.add(listing)
    await session.commit()
    await session.refresh(listing)
    return listing


async def get_approved_listings(
    session: AsyncSession,
    category: ListingCategory | None = None,
    subcategory: str | None = None,
    course: str | None = None,
    group_name: str | None = None,
    faculty: str | None = None,
    department: str | None = None,
    subject: str | None = None,
) -> list[Listing]:
    stmt = select(Listing).where(Listing.status == ListingStatus.approved)
    stmt = stmt.where((Listing.expires_at.is_(None)) | (Listing.expires_at > dt.datetime.utcnow()))
    if category:
        stmt = stmt.where(Listing.category == category)
    if subcategory:
        stmt = stmt.where(Listing.subcategory == subcategory)
    if course:
        stmt = stmt.where(Listing.course == course)
    if group_name:
        stmt = stmt.where(Listing.group_name == group_name)
    if faculty:
        stmt = stmt.where(Listing.faculty == faculty)
    if department:
        stmt = stmt.where(Listing.department == department)
    if subject:
        stmt = stmt.where(Listing.subject == subject)
    result = await session.execute(stmt)
    return list(result.scalars().all())


async def get_listing(session: AsyncSession, listing_id: int) -> Listing | None:
    result = await session.execute(select(Listing).where(Listing.id == listing_id))
    return result.scalar_one_or_none()


async def get_listing_with_seller(session: AsyncSession, listing_id: int) -> tuple[Listing, User] | None:
    listing = await get_listing(session, listing_id)
    if not listing:
        return None
    seller_result = await session.execute(select(User).where(User.id == listing.seller_id))
    seller = seller_result.scalar_one()
    return listing, seller


async def get_similar_listings(session: AsyncSession, listing: Listing, limit: int = 4) -> list[Listing]:
    stmt = (
        select(Listing)
        .where(
            Listing.status == ListingStatus.approved,
            Listing.category == listing.category,
            Listing.id != listing.id,
        )
        .order_by(Listing.created_at.desc())
        .limit(limit)
    )
    result = await session.execute(stmt)
    return list(result.scalars().all())


async def add_listing_comment(
    session: AsyncSession, listing_id: int, user_id: int, text: str, rating: int | None = None
) -> ListingComment:
    comment = ListingComment(listing_id=listing_id, user_id=user_id, text=text, rating=rating)
    session.add(comment)
    await session.commit()
    await session.refresh(comment)
    return comment


async def get_listing_comments(session: AsyncSession, listing_id: int) -> list[tuple[ListingComment, User]]:
    stmt = (
        select(ListingComment, User)
        .join(User, User.id == ListingComment.user_id)
        .where(ListingComment.listing_id == listing_id)
        .order_by(ListingComment.created_at.asc())
    )
    result = await session.execute(stmt)
    return [(c, u) for c, u in result.all()]


async def get_comment_with_author(session: AsyncSession, comment_id: int) -> tuple[ListingComment, User] | None:
    stmt = select(ListingComment, User).join(User, User.id == ListingComment.user_id).where(ListingComment.id == comment_id)
    result = await session.execute(stmt)
    row = result.first()
    return (row[0], row[1]) if row else None


async def update_comment(session: AsyncSession, comment: ListingComment, text: str, rating: int | None) -> ListingComment:
    comment.text = text
    comment.rating = rating
    await session.commit()
    await session.refresh(comment)
    return comment


async def delete_comment(session: AsyncSession, comment: ListingComment) -> None:
    await session.delete(comment)
    await session.commit()


async def delete_listing(session: AsyncSession, listing_id: int) -> bool:
    listing = await get_listing(session, listing_id)
    if not listing:
        return False
    await session.delete(listing)
    await session.commit()
    return True


async def update_listing(session: AsyncSession, listing: Listing, **fields) -> Listing:
    """Обновляет переданные поля объявления. Неизвестные/None-значения игнорируются."""
    for key, value in fields.items():
        if value is not None and hasattr(listing, key):
            setattr(listing, key, value)
    await session.commit()
    await session.refresh(listing)
    return listing


async def delete_catalog_item(session: AsyncSession, item_id: int) -> bool:
    result = await session.execute(select(QuizCatalogItem).where(QuizCatalogItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        return False
    await session.delete(item)
    await session.commit()
    return True


async def set_listing_status(session: AsyncSession, listing: Listing, status: ListingStatus) -> Listing:
    listing.status = status
    await session.commit()
    await session.refresh(listing)
    return listing


FILTERABLE_FIELDS = {"subcategory", "course", "group_name", "faculty", "department", "subject"}

# Примеры подкатегорий — показываются в попапе фильтра/формы, даже если в БД
# ещё нет ни одного объявления с таким значением.
SUBCATEGORY_EXAMPLES = {
    "study": [
        "Quizizz", "СРС", "Реферат", "Доклад", "Шпаргалки", "Сканер",
        "Курсовая работа", "Дипломная работа", "Презентация", "Конспект", "Лабораторная работа",
        "Прочее",
    ],
    "goods": [
        "Учебники", "Электроника", "Одежда", "Мебель", "Канцелярия", "Спортивные товары", "Прочее",
    ],
}

# Базовые примеры курса — чтобы форма не была пустой при первом объявлении. Максимум 4.
COURSE_EXAMPLES = ["1", "2", "3", "4"]

FALLBACK_OTHER = "Прочее"

# Порядок зависимости для каскадных полей: каждое следующее поле сужается
# по значениям всех предыдущих (факультет → кафедра → курс → группа → предмет).
CASCADE_ORDER = ["faculty", "department", "course", "group_name", "subject"]


def get_subcategory_examples(category: str | None) -> list[str]:
    if category in SUBCATEGORY_EXAMPLES:
        return SUBCATEGORY_EXAMPLES[category]
    # категория не выбрана ("Все") — отдаём объединённый список
    return SUBCATEGORY_EXAMPLES["study"] + SUBCATEGORY_EXAMPLES["goods"]


async def search_listing_filter_options(
    session: AsyncSession,
    field: str,
    query: str = "",
    category: str | None = None,
    faculty: str | None = None,
    department: str | None = None,
    course: str | None = None,
    group_name: str | None = None,
) -> list[str]:
    """Автокомплит: уникальные непустые значения поля из опубликованных объявлений
    (с учётом выбранной категории и уже выбранных полей выше по цепочке зависимости
    факультет → кафедра → курс → группа → предмет), отфильтрованные по подстроке query.
    Для subcategory и course подмешиваются готовые примеры; для всех select-полей
    гарантированно доступен вариант «Прочее» — так поле всегда можно выбрать,
    даже если в БД ещё нет ни одного значения."""
    if field not in FILTERABLE_FIELDS:
        return []

    column = getattr(Listing, field)
    stmt = select(column).where(Listing.status == ListingStatus.approved, column.is_not(None), column != "")
    if category:
        stmt = stmt.where(Listing.category == category)

    # каскадные ограничения: применяем значение поля X, только если X стоит
    # РАНЬШЕ запрашиваемого field в CASCADE_ORDER
    scoped_values = {"faculty": faculty, "department": department, "course": course, "group_name": group_name}
    if field in CASCADE_ORDER:
        field_position = CASCADE_ORDER.index(field)
        for prior_field in CASCADE_ORDER[:field_position]:
            value = scoped_values.get(prior_field)
            if value:
                stmt = stmt.where(getattr(Listing, prior_field) == value)

    stmt = stmt.distinct()
    if query:
        stmt = stmt.where(column.ilike(f"%{query}%"))
    stmt = stmt.limit(20)
    result = await session.execute(stmt)
    db_values = [row[0] for row in result.all() if row[0]]

    examples: list[str] = []
    if field == "subcategory":
        examples = get_subcategory_examples(category)
    elif field == "course":
        examples = COURSE_EXAMPLES

    if query:
        q_lower = query.lower()
        examples = [e for e in examples if q_lower in e.lower()]

    combined = list(dict.fromkeys(examples + db_values))

    if not query or FALLBACK_OTHER.lower().startswith(query.lower()):
        if FALLBACK_OTHER not in combined:
            combined.append(FALLBACK_OTHER)

    return combined[:20]
