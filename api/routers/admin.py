from fastapi import APIRouter, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from database.engine import async_session
from database.models import (
    User, Order, OrderStatus, OrderType, Listing, ListingStatus, QuizCatalogItem
)
from database import crud
from config import ADMIN_CHAT_ID, BOT_USERNAME
from api.schemas import CreateQuizIn, UpdateQuizIn

router = APIRouter()


@router.get("/stats")
async def get_stats():
    """Статистика для дашборда"""
    async with async_session() as session:
        users_count = await session.execute(select(func.count(User.id)))
        orders_count = await session.execute(select(func.count(Order.id)))
        listings_count = await session.execute(select(func.count(Listing.id)))
        pending_count = await session.execute(
            select(func.count(Listing.id)).where(Listing.status == ListingStatus.pending)
        )

        return {
            "users": users_count.scalar() or 0,
            "orders": orders_count.scalar() or 0,
            "listings": listings_count.scalar() or 0,
            "pending": pending_count.scalar() or 0,
        }


@router.get("/pending")
async def get_pending_items():
    """Ожидающие модерации объявления"""
    async with async_session() as session:
        result = await session.execute(
            select(Listing)
            .where(Listing.status == ListingStatus.pending)
            .order_by(Listing.created_at.desc())
            .limit(10)
        )
        listings = result.scalars().all()

        return [
            {
                "id": l.id,
                "type": "listing",
                "title": l.title,
                "category": l.category.value,
                "created_at": l.created_at.strftime("%Y-%m-%d %H:%M"),
            }
            for l in listings
        ]


@router.get("/orders")
async def get_orders(filter: str = "all"):
    """Список заказов с фильтром"""
    async with async_session() as session:
        stmt = select(Order, User).join(User, Order.user_id == User.id).order_by(Order.created_at.desc())

        if filter == "awaiting_payment":
            stmt = stmt.where(Order.status == OrderStatus.awaiting_payment)
        elif filter == "payment_review":
            stmt = stmt.where(Order.status == OrderStatus.payment_review)
        elif filter == "in_progress":
            stmt = stmt.where(Order.status == OrderStatus.in_progress)
        elif filter == "done":
            stmt = stmt.where(Order.status == OrderStatus.done)

        result = await session.execute(stmt)
        rows = result.all()

        orders_data = []
        for o, u in rows:
            title = f"Индивидуальный заказ #{o.id}"
            if o.order_type == OrderType.ready_quiz and o.catalog_item_id:
                # Загрузить название теста
                quiz_result = await session.execute(
                    select(QuizCatalogItem).where(QuizCatalogItem.id == o.catalog_item_id)
                )
                quiz = quiz_result.scalar_one_or_none()
                if quiz:
                    title = quiz.title
                else:
                    title = f"Готовый тест #{o.catalog_item_id}"

            orders_data.append({
                "id": o.id,
                "type": o.order_type.value,
                "price": o.price,
                "status": o.status.value,
                "created_at": o.created_at.strftime("%Y-%m-%d %H:%M"),
                "user": {
                    "id": u.id,
                    "tg_id": u.tg_id,
                    "username": u.username,
                    "full_name": u.full_name,
                    "phone": u.phone,
                },
                "title": title,
                "telegram_link": f"https://t.me/{BOT_USERNAME}" if u.username else f"https://t.me/{u.tg_id}",
            })

        return orders_data


@router.get("/listings")
async def get_listings(filter: str = "all"):
    """Список объявлений с фильтром"""
    async with async_session() as session:
        stmt = select(Listing, User).join(User, Listing.seller_id == User.id).order_by(Listing.created_at.desc())

        if filter == "pending":
            stmt = stmt.where(Listing.status == ListingStatus.pending)
        elif filter == "approved":
            stmt = stmt.where(Listing.status == ListingStatus.approved)
        elif filter == "rejected":
            stmt = stmt.where(Listing.status == ListingStatus.rejected)

        result = await session.execute(stmt)
        rows = result.all()

        return [
            {
                "id": l.id,
                "title": l.title,
                "description": l.description,
                "price": l.price,
                "status": l.status.value,
                "category": l.category.value,
                "subcategory": l.subcategory,
                "created_at": l.created_at.strftime("%Y-%m-%d %H:%M"),
                "expires_at": l.expires_at.strftime("%Y-%m-%d") if l.expires_at else None,
                "seller": {
                    "id": u.id,
                    "tg_id": u.tg_id,
                    "username": u.username,
                    "full_name": u.full_name,
                    "phone": u.phone,
                },
                "contact": l.contact,
                "photo_urls": l.photo_urls,
            }
            for l, u in rows
        ]


@router.get("/listings/{listing_id}")
async def get_listing_detail(listing_id: int):
    """Детальная информация об объявлении"""
    async with async_session() as session:
        stmt = select(Listing, User).join(User, Listing.seller_id == User.id).where(Listing.id == listing_id)
        result = await session.execute(stmt)
        row = result.first()

        if not row:
            raise HTTPException(status_code=404, detail="Listing not found")

        l, u = row

        return {
            "id": l.id,
            "title": l.title,
            "description": l.description,
            "price": l.price,
            "status": l.status.value,
            "category": l.category.value,
            "subcategory": l.subcategory,
            "created_at": l.created_at.strftime("%Y-%m-%d %H:%M"),
            "expires_at": l.expires_at.strftime("%Y-%m-%d") if l.expires_at else None,
            "seller": {
                "id": u.id,
                "tg_id": u.tg_id,
                "username": u.username,
                "full_name": u.full_name,
                "phone": u.phone,
            },
            "contact": l.contact,
            "photo_urls": l.photo_urls,
            "course": l.course,
            "group_name": l.group_name,
            "faculty": l.faculty,
            "department": l.department,
            "subject": l.subject,
        }


@router.put("/listings/{listing_id}")
async def update_listing(listing_id: int, title: str = None, description: str = None, price: int = None, expires_at: str = None, contact: str = None):
    """Обновить объявление"""
    async with async_session() as session:
        listing = await crud.get_listing(session, listing_id)
        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")

        if title:
            listing.title = title
        if description:
            listing.description = description
        if price:
            listing.price = price
        if expires_at:
            from datetime import datetime
            listing.expires_at = datetime.strptime(expires_at, "%Y-%m-%d")
        if contact:
            listing.contact = contact

        await session.commit()
        return {"success": True}


@router.delete("/listings/{listing_id}")
async def delete_listing_admin(listing_id: int):
    """Удалить объявление (админ)"""
    async with async_session() as session:
        ok = await crud.delete_listing(session, listing_id)
        if not ok:
            raise HTTPException(status_code=404, detail="Listing not found")
        return {"success": True}


@router.get("/quizzes")
async def get_quizzes(search: str = ""):
    """Список тестов с поиском"""
    async with async_session() as session:
        stmt = select(QuizCatalogItem).order_by(QuizCatalogItem.created_at.desc())

        if search:
            stmt = stmt.where(
                (QuizCatalogItem.title.ilike(f"%{search}%")) |
                (QuizCatalogItem.subject.ilike(f"%{search}%"))
            )

        result = await session.execute(stmt)
        quizzes = result.scalars().all()

        return [
            {
                "id": q.id,
                "title": q.title,
                "subject": q.subject,
                "price": q.price,
                "created_at": q.created_at.strftime("%Y-%m-%d %H:%M"),
            }
            for q in quizzes
        ]


@router.put("/quizzes/{quiz_id}")
async def update_quiz(quiz_id: int, data: UpdateQuizIn):
    """Обновить тест"""
    async with async_session() as session:
        result = await session.execute(select(QuizCatalogItem).where(QuizCatalogItem.id == quiz_id))
        quiz = result.scalar_one_or_none()

        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")

        if data.title:
            quiz.title = data.title
        if data.price:
            quiz.price = data.price

        await session.commit()
        return {"success": True}


@router.delete("/quizzes/{quiz_id}")
async def delete_quiz(quiz_id: int):
    """Удалить тест"""
    async with async_session() as session:
        ok = await crud.delete_catalog_item(session, quiz_id)
        if not ok:
            raise HTTPException(status_code=404, detail="Quiz not found")
        return {"success": True}


@router.get("/users")
async def get_users():
    """Список пользователей"""
    async with async_session() as session:
        result = await session.execute(
            select(User)
            .order_by(User.created_at.desc())
            .limit(50)
        )
        users = result.scalars().all()

        return [
            {
                "id": u.id,
                "tg_id": u.tg_id,
                "username": u.username,
                "full_name": u.full_name,
                "phone": u.phone,
                "points": u.points,
                "created_at": u.created_at.strftime("%Y-%m-%d %H:%M"),
                "is_admin": u.tg_id == ADMIN_CHAT_ID,
                "telegram_link": f"https://t.me/{BOT_USERNAME}" if u.username else f"https://t.me/{u.tg_id}",
            }
            for u in users
        ]


@router.post("/listings/{listing_id}/approve")
async def approve_listing(listing_id: int):
    """Одобрить объявление"""
    async with async_session() as session:
        listing = await crud.get_listing(session, listing_id)
        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")

        listing = await crud.set_listing_status(session, listing, ListingStatus.approved)
        return {"success": True}


@router.post("/listings/{listing_id}/reject")
async def reject_listing(listing_id: int, reason: str):
    """Отклонить объявление"""
    async with async_session() as session:
        listing = await crud.get_listing(session, listing_id)
        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")

        listing = await crud.set_listing_status(session, listing, ListingStatus.rejected)
        # TODO: отправить уведомление пользователю с причиной
        return {"success": True}


@router.post("/orders/{order_id}/approve")
async def approve_order(order_id: int):
    """Одобрить заказ"""
    async with async_session() as session:
        result = await session.execute(select(Order).where(Order.id == order_id))
        order = result.scalar_one_or_none()

        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        order = await crud.set_order_status(session, order, OrderStatus.in_progress)
        return {"success": True}


@router.post("/orders/{order_id}/reject")
async def reject_order(order_id: int, reason: str):
    """Отклонить заказ"""
    async with async_session() as session:
        result = await session.execute(select(Order).where(Order.id == order_id))
        order = result.scalar_one_or_none()

        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        order = await crud.reject_order_with_reason(session, order, reason)
        return {"success": True}


@router.post("/quizzes")
async def create_quiz(data: CreateQuizIn):
    """Создать новый тест"""
    async with async_session() as session:
        quiz = QuizCatalogItem(
            title=data.title,
            subject=data.subject,
            description=data.description,
            faculty=data.faculty,
            department=data.department,
            course=data.course,
            group_name=data.group_name,
            price=data.price,
            file_url=data.file_url or "",
            preview_text=data.preview_text,
        )
        session.add(quiz)
        await session.commit()
        await session.refresh(quiz)
        return {"success": True, "id": quiz.id}
