from fastapi import APIRouter, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from database.engine import async_session
from database.models import (
    User, Order, OrderStatus, OrderType, Listing, ListingStatus, QuizCatalogItem,
    Faculty, Department, Group, Banner, Advertisement, FAQ, AppSettings, SupportSettings,
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
                "description": q.description,
                "faculty": q.faculty,
                "department": q.department,
                "course": q.course,
                "group_name": q.group_name,
                "price": q.price,
                "file_url": q.file_url,
                "preview_text": q.preview_text,
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


@router.get("/cascade/faculties")
async def get_faculties():
    """Список уникальных факультетов"""
    async with async_session() as session:
        result = await session.execute(
            select(QuizCatalogItem.faculty)
            .where(QuizCatalogItem.faculty.is_not(None))
            .distinct()
        )
        faculties = [row[0] for row in result.all() if row[0]]
        return faculties


@router.get("/cascade/departments")
async def get_departments(faculty: str = None):
    """Список кафедр по факультету"""
    async with async_session() as session:
        stmt = select(QuizCatalogItem.department).where(QuizCatalogItem.department.is_not(None))
        if faculty:
            stmt = stmt.where(QuizCatalogItem.faculty == faculty)
        result = await session.execute(stmt.distinct())
        departments = [row[0] for row in result.all() if row[0]]
        return departments


@router.get("/cascade/groups")
async def get_groups(faculty: str = None, department: str = None):
    """Список групп по факультету и кафедре"""
    async with async_session() as session:
        stmt = select(QuizCatalogItem.group_name).where(QuizCatalogItem.group_name.is_not(None))
        if faculty:
            stmt = stmt.where(QuizCatalogItem.faculty == faculty)
        if department:
            stmt = stmt.where(QuizCatalogItem.department == department)
        result = await session.execute(stmt.distinct())
        groups = [row[0] for row in result.all() if row[0]]
        return groups


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


# ---------- Настройки API ----------

@router.get("/settings/faculties")
async def get_faculties_list():
    """Список факультетов"""
    async with async_session() as session:
        faculties = await crud.get_faculties(session)
        return [{"id": f.id, "name": f.name} for f in faculties]


@router.post("/settings/faculties")
async def create_faculty(data: dict):
    """Создать факультет"""
    name = data.get("name")
    if not name:
        raise HTTPException(status_code=400, detail="Name required")
    async with async_session() as session:
        faculty = await crud.create_faculty(session, name)
        return {"id": faculty.id, "name": faculty.name}


@router.delete("/settings/faculties/{faculty_id}")
async def delete_faculty(faculty_id: int):
    """Удалить факультет"""
    async with async_session() as session:
        ok = await crud.delete_faculty(session, faculty_id)
        if not ok:
            raise HTTPException(status_code=404, detail="Faculty not found")
        return {"success": True}


@router.get("/settings/departments")
async def get_departments_list(faculty_id: int = None):
    """Список кафедр"""
    async with async_session() as session:
        departments = await crud.get_departments(session, faculty_id)
        return [{"id": d.id, "name": d.name, "faculty_id": d.faculty_id} for d in departments]


@router.post("/settings/departments")
async def create_department(data: dict):
    """Создать кафедру"""
    name = data.get("name")
    faculty_id = data.get("faculty_id")
    if not name or not faculty_id:
        raise HTTPException(status_code=400, detail="Name and faculty_id required")
    async with async_session() as session:
        department = await crud.create_department(session, name, faculty_id)
        return {"id": department.id, "name": department.name, "faculty_id": department.faculty_id}


@router.delete("/settings/departments/{department_id}")
async def delete_department(department_id: int):
    """Удалить кафедру"""
    async with async_session() as session:
        ok = await crud.delete_department(session, department_id)
        if not ok:
            raise HTTPException(status_code=404, detail="Department not found")
        return {"success": True}


@router.get("/settings/groups")
async def get_groups_list(faculty_id: int = None, department_id: int = None):
    """Список групп"""
    async with async_session() as session:
        groups = await crud.get_groups(session, faculty_id, department_id)
        return [{"id": g.id, "name": g.name, "faculty_id": g.faculty_id, "department_id": g.department_id} for g in groups]


@router.post("/settings/groups")
async def create_group(data: dict):
    """Создать группу"""
    name = data.get("name")
    faculty_id = data.get("faculty_id")
    department_id = data.get("department_id")
    if not name or not faculty_id or not department_id:
        raise HTTPException(status_code=400, detail="Name, faculty_id and department_id required")
    async with async_session() as session:
        group = await crud.create_group(session, name, faculty_id, department_id)
        return {"id": group.id, "name": group.name, "faculty_id": group.faculty_id, "department_id": group.department_id}


@router.delete("/settings/groups/{group_id}")
async def delete_group(group_id: int):
    """Удалить группу"""
    async with async_session() as session:
        ok = await crud.delete_group(session, group_id)
        if not ok:
            raise HTTPException(status_code=404, detail="Group not found")
        return {"success": True}


@router.get("/settings/banners")
async def get_banners_list():
    """Список баннеров"""
    async with async_session() as session:
        banners = await crud.get_banners(session)
        return [{"id": b.id, "title": b.title, "image_url": b.image_url, "link_url": b.link_url, "order": b.order} for b in banners]


@router.post("/settings/banners")
async def create_banner(data: dict):
    """Создать баннер"""
    title = data.get("title")
    image_url = data.get("image_url")
    link_url = data.get("link_url")
    order = data.get("order", 0)
    if not title or not image_url or not link_url:
        raise HTTPException(status_code=400, detail="Title, image_url and link_url required")
    async with async_session() as session:
        banner = await crud.create_banner(session, title, image_url, link_url, order)
        return {"id": banner.id, "title": banner.title, "image_url": banner.image_url, "link_url": banner.link_url, "order": banner.order}


@router.delete("/settings/banners/{banner_id}")
async def delete_banner(banner_id: int):
    """Удалить баннер"""
    async with async_session() as session:
        ok = await crud.delete_banner(session, banner_id)
        if not ok:
            raise HTTPException(status_code=404, detail="Banner not found")
        return {"success": True}


@router.get("/settings/ads")
async def get_ads_list():
    """Список рекламы"""
    async with async_session() as session:
        ads = await crud.get_advertisements(session)
        return [{"id": a.id, "title": a.title, "description": a.description, "image_url": a.image_url, "link_url": a.link_url, "order": a.order} for a in ads]


@router.post("/settings/ads")
async def create_ad(data: dict):
    """Создать рекламу"""
    title = data.get("title")
    description = data.get("description")
    image_url = data.get("image_url")
    link_url = data.get("link_url")
    order = data.get("order", 0)
    if not title or not image_url or not link_url:
        raise HTTPException(status_code=400, detail="Title, image_url and link_url required")
    async with async_session() as session:
        ad = await crud.create_advertisement(session, title, description, image_url, link_url, order)
        return {"id": ad.id, "title": ad.title, "description": ad.description, "image_url": ad.image_url, "link_url": ad.link_url, "order": ad.order}


@router.delete("/settings/ads/{ad_id}")
async def delete_ad(ad_id: int):
    """Удалить рекламу"""
    async with async_session() as session:
        ok = await crud.delete_advertisement(session, ad_id)
        if not ok:
            raise HTTPException(status_code=404, detail="Advertisement not found")
        return {"success": True}


@router.get("/settings/faq")
async def get_faq_list():
    """Список FAQ"""
    async with async_session() as session:
        faqs = await crud.get_faq(session)
        return [{"id": f.id, "question": f.question, "answer": f.answer, "order": f.order} for f in faqs]


@router.post("/settings/faq")
async def create_faq(data: dict):
    """Создать FAQ"""
    question = data.get("question")
    answer = data.get("answer")
    order = data.get("order", 0)
    if not question or not answer:
        raise HTTPException(status_code=400, detail="Question and answer required")
    async with async_session() as session:
        faq = await crud.create_faq(session, question, answer, order)
        return {"id": faq.id, "question": faq.question, "answer": faq.answer, "order": faq.order}


@router.delete("/settings/faq/{faq_id}")
async def delete_faq(faq_id: int):
    """Удалить FAQ"""
    async with async_session() as session:
        ok = await crud.delete_faq(session, faq_id)
        if not ok:
            raise HTTPException(status_code=404, detail="FAQ not found")
        return {"success": True}


@router.get("/settings/app")
async def get_app_settings():
    """Настройки приложения"""
    async with async_session() as session:
        settings = await crud.get_app_settings(session)
        return {"app_name": settings.app_name, "app_icon": settings.app_icon}


@router.put("/settings/app")
async def update_app_settings(data: dict):
    """Обновить настройки приложения"""
    app_name = data.get("app_name")
    app_icon = data.get("app_icon")
    async with async_session() as session:
        settings = await crud.update_app_settings(session, app_name, app_icon)
        return {"app_name": settings.app_name, "app_icon": settings.app_icon}


@router.get("/settings/support")
async def get_support_settings():
    """Настройки поддержки"""
    async with async_session() as session:
        settings = await crud.get_support_settings(session)
        return {
            "whatsapp": settings.whatsapp,
            "instagram": settings.instagram,
            "tiktok": settings.tiktok,
            "email": settings.email,
            "telegram": settings.telegram,
        }


@router.put("/settings/support")
async def update_support_settings(data: dict):
    """Обновить настройки поддержки"""
    whatsapp = data.get("whatsapp")
    instagram = data.get("instagram")
    tiktok = data.get("tiktok")
    email = data.get("email")
    telegram = data.get("telegram")
    async with async_session() as session:
        settings = await crud.update_support_settings(session, whatsapp, instagram, tiktok, email, telegram)
        return {
            "whatsapp": settings.whatsapp,
            "instagram": settings.instagram,
            "tiktok": settings.tiktok,
            "email": settings.email,
            "telegram": settings.telegram,
        }


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
