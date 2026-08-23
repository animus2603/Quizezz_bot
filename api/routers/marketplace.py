from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from database.engine import get_session
from database import crud
from database.models import ListingCategory
from api.schemas import ListingOut, CreateListingIn
from bot.notify import notify_admin_new_listing

router = APIRouter(prefix="/marketplace", tags=["marketplace"])


@router.get("/listings", response_model=list[ListingOut])
async def list_listings(category: str | None = None, session: AsyncSession = Depends(get_session)):
    cat = ListingCategory(category) if category else None
    return await crud.get_approved_listings(session, cat)


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
        title=data.title,
        description=data.description,
        price=data.price,
        photo_file_id=data.photo_file_id,
        contact=data.contact,
    )
    await notify_admin_new_listing(listing, user)
    return listing
