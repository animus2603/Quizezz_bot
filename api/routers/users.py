from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database.engine import get_session
from database import crud
from database.models import QuizCatalogItem, OrderType
from api.schemas import ProfileOut, ProfileIn, ApplyReferralIn, UserOrderOut, UserListingOut
from config import BOT_USERNAME

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/profile", response_model=ProfileOut)
async def get_or_init_profile(data: ProfileIn, session: AsyncSession = Depends(get_session)):
    """Отдаёт профиль пользователя, создавая его при первом заходе в раздел «Профиль»."""
    user = await crud.get_or_create_user(session, data.tg_id, data.username, data.full_name)
    referral_count = await crud.count_referrals(session, user.tg_id)
    out = ProfileOut.model_validate(user)
    out.referral_count = referral_count
    out.bot_username = BOT_USERNAME
    return out


@router.post("/apply-referral")
async def apply_referral(data: ApplyReferralIn, session: AsyncSession = Depends(get_session)):
    """Покупатель вводит реферальный код друга (если не пришёл по прямой ссылке)."""
    try:
        referrer_tg_id = int(data.referral_code.strip().lstrip("#"))
    except ValueError:
        raise HTTPException(400, "Неверный формат кода")

    user = await crud.get_or_create_user(session, data.tg_id, None, None)
    ok, reason = await crud.apply_referral_code(session, user, referrer_tg_id)
    if not ok:
        messages = {
            "already_set": "К вам уже привязан пригласивший",
            "self": "Нельзя ввести свой же код",
            "not_found": "Пользователь с таким кодом не найден",
        }
        raise HTTPException(400, messages.get(reason, "Не удалось применить код"))
    return {"ok": True}


@router.get("/{tg_id}/orders", response_model=list[UserOrderOut])
async def get_my_orders(tg_id: int, session: AsyncSession = Depends(get_session)):
    user = await crud.get_user_by_tg_id(session, tg_id)
    if not user:
        return []

    orders = await crud.get_user_orders(session, user.id)
    result = []
    for order in orders:
        item_data = {}
        if order.order_type == OrderType.ready_quiz and order.catalog_item_id:
            item_res = await session.execute(
                select(QuizCatalogItem).where(QuizCatalogItem.id == order.catalog_item_id)
            )
            item = item_res.scalar_one_or_none()
            if item:
                item_data = {
                    "title": item.title,
                    "subject": item.subject,
                    "course": item.course,
                    "group_name": item.group_name,
                    "faculty": item.faculty,
                    "department": item.department,
                }
        else:
            item_data = {"title": "Индивидуальный тест", "subject": order.comment}

        result.append(UserOrderOut(
            id=order.id,
            order_type=order.order_type.value,
            status=order.status.value,
            price=order.price,
            created_at=order.created_at,
            rejection_reason=order.rejection_reason,
            can_cancel=crud.order_cancel_seconds_left(order) > 0,
            cancel_seconds_left=crud.order_cancel_seconds_left(order),
            **item_data,
        ))
    return result


@router.get("/{tg_id}/listings", response_model=list[UserListingOut])
async def get_my_listings(tg_id: int, session: AsyncSession = Depends(get_session)):
    user = await crud.get_user_by_tg_id(session, tg_id)
    if not user:
        return []
    return await crud.get_user_listings(session, user.id)
