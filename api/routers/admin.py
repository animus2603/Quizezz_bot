from fastapi import APIRouter, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from database.engine import async_session
from database.models import (
    User, Order, OrderStatus, Listing, ListingStatus, QuizCatalogItem
)
from database import crud
from config import ADMIN_CHAT_ID

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
        stmt = select(Order).order_by(Order.created_at.desc())

        if filter == "awaiting_payment":
            stmt = stmt.where(Order.status == OrderStatus.awaiting_payment)
        elif filter == "payment_review":
            stmt = stmt.where(Order.status == OrderStatus.payment_review)
        elif filter == "in_progress":
            stmt = stmt.where(Order.status == OrderStatus.in_progress)
        elif filter == "done":
            stmt = stmt.where(Order.status == OrderStatus.done)

        result = await session.execute(stmt)
        orders = result.scalars().all()

        return [
            {
                "id": o.id,
                "type": o.order_type.value,
                "price": o.price,
                "status": o.status.value,
                "created_at": o.created_at.strftime("%Y-%m-%d %H:%M"),
            }
            for o in orders
        ]


@router.get("/listings")
async def get_listings(filter: str = "all"):
    """Список объявлений с фильтром"""
    async with async_session() as session:
        stmt = select(Listing).order_by(Listing.created_at.desc())

        if filter == "pending":
            stmt = stmt.where(Listing.status == ListingStatus.pending)
        elif filter == "approved":
            stmt = stmt.where(Listing.status == ListingStatus.approved)
        elif filter == "rejected":
            stmt = stmt.where(Listing.status == ListingStatus.rejected)

        result = await session.execute(stmt)
        listings = result.scalars().all()

        return [
            {
                "id": l.id,
                "title": l.title,
                "description": l.description,
                "price": l.price,
                "status": l.status.value,
                "category": l.category.value,
                "created_at": l.created_at.strftime("%Y-%m-%d %H:%M"),
            }
            for l in listings
        ]


@router.get("/quizzes")
async def get_quizzes():
    """Список тестов"""
    async with async_session() as session:
        result = await session.execute(
            select(QuizCatalogItem)
            .order_by(QuizCatalogItem.created_at.desc())
        )
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
                "points": u.points,
                "created_at": u.created_at.strftime("%Y-%m-%d %H:%M"),
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
