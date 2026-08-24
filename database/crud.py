import datetime as dt

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import (
    User, QuizCatalogItem, Order, OrderType, OrderStatus,
    Listing, ListingCategory, ListingStatus,
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


async def get_or_create_user(session: AsyncSession, tg_id: int, username: str | None, full_name: str | None) -> User:
    result = await session.execute(select(User).where(User.tg_id == tg_id))
    user = result.scalar_one_or_none()
    if user:
        return user
    user = User(tg_id=tg_id, username=username, full_name=full_name)
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


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


async def create_listing(
    session: AsyncSession,
    seller_id: int,
    category: ListingCategory,
    title: str,
    description: str | None,
    price: int | None,
    photo_file_id: str | None,
    contact: str,
) -> Listing:
    listing = Listing(
        seller_id=seller_id,
        category=category,
        title=title,
        description=description,
        price=price,
        photo_file_id=photo_file_id,
        contact=contact,
        status=ListingStatus.pending,
    )
    session.add(listing)
    await session.commit()
    await session.refresh(listing)
    return listing


async def get_approved_listings(session: AsyncSession, category: ListingCategory | None = None) -> list[Listing]:
    stmt = select(Listing).where(Listing.status == ListingStatus.approved)
    if category:
        stmt = stmt.where(Listing.category == category)
    result = await session.execute(stmt)
    return list(result.scalars().all())


async def get_listing(session: AsyncSession, listing_id: int) -> Listing | None:
    result = await session.execute(select(Listing).where(Listing.id == listing_id))
    return result.scalar_one_or_none()


async def set_listing_status(session: AsyncSession, listing: Listing, status: ListingStatus) -> Listing:
    listing.status = status
    await session.commit()
    await session.refresh(listing)
    return listing
