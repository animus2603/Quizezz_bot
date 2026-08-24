from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database.engine import get_session
from database import crud
from api.schemas import ProfileOut, ProfileIn, UserOrderOut, UserListingOut

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/profile", response_model=ProfileOut)
async def get_or_init_profile(data: ProfileIn, session: AsyncSession = Depends(get_session)):
    """Отдаёт профиль пользователя, создавая его при первом заходе в раздел «Профиль»."""
    user = await crud.get_or_create_user(session, data.tg_id, data.username, data.full_name)
    return user


@router.get("/{tg_id}/orders", response_model=list[UserOrderOut])
async def get_my_orders(tg_id: int, session: AsyncSession = Depends(get_session)):
    user = await crud.get_user_by_tg_id(session, tg_id)
    if not user:
        return []
    return await crud.get_user_orders(session, user.id)


@router.get("/{tg_id}/listings", response_model=list[UserListingOut])
async def get_my_listings(tg_id: int, session: AsyncSession = Depends(get_session)):
    user = await crud.get_user_by_tg_id(session, tg_id)
    if not user:
        return []
    return await crud.get_user_listings(session, user.id)
