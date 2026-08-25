from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from database.engine import get_session
from database import crud
from database.models import ListingCategory
from api.schemas import ListingOut, CreateListingIn, FilterOptionsOut
from bot.notify import notify_admin_new_listing

router = APIRouter(prefix="/marketplace", tags=["marketplace"])


@router.get("/listings", response_model=list[ListingOut])
async def list_listings(
    category: str | None = None,
    subcategory: str | None = None,
    course: str | None = None,
    group_name: str | None = None,
    faculty: str | None = None,
    department: str | None = None,
    subject: str | None = None,
    session: AsyncSession = Depends(get_session),
):
    cat = ListingCategory(category) if category else None
    return await crud.get_approved_listings(
        session, cat, subcategory, course, group_name, faculty, department, subject
    )


@router.get("/filter-options/{field}", response_model=FilterOptionsOut)
async def filter_options(field: str, q: str = "", session: AsyncSession = Depends(get_session)):
    """Автокомплит для попапа фильтра: уникальные значения поля, отфильтрованные по q."""
    options = await crud.search_listing_filter_options(session, field, q)
    return FilterOptionsOut(options=options)


@router.post("/listings", response_model=ListingOut)
async def create_listing(data: CreateListingIn, session: AsyncSession = Depends(get_session)):
    try:
        category = ListingCategory(data.category)
    except ValueError:
        raise HTTPException(400, "Неверная категория")

    user = await crud.get_or_create_user(session, data.tg_id, data.username, data.full_name)
    listing = await crud.create_listing(
        session,
        seller_id=user.id,
        category=category,
        subcategory=data.subcategory,
        title=data.title,
        description=data.description,
        price=data.price,
        photo_file_id=data.photo_file_id,
        contact=data.contact,
        course=data.course,
        group_name=data.group_name,
        faculty=data.faculty,
        department=data.department,
        subject=data.subject,
        attachment_url=data.attachment_url,
    )
    await notify_admin_new_listing(listing, user)
    return listing
