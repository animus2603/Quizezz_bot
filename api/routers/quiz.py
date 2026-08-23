from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from database.engine import get_session
from database import crud
from database.models import OrderStatus
from api.schemas import CatalogItemOut, CreateReadyOrderIn, CreateCustomOrderIn, OrderOut
from config import PRICE_CUSTOM_QUIZ
from bot.notify import notify_admin_new_order

router = APIRouter(prefix="/quiz", tags=["quiz"])


@router.get("/catalog", response_model=list[CatalogItemOut])
async def list_catalog(session: AsyncSession = Depends(get_session)):
    return await crud.get_active_catalog(session)


@router.post("/order/ready", response_model=OrderOut)
async def order_ready_quiz(data: CreateReadyOrderIn, session: AsyncSession = Depends(get_session)):
    user = await crud.get_or_create_user(session, data.tg_id, data.username, data.full_name)
    items = await crud.get_active_catalog(session)
    item = next((i for i in items if i.id == data.catalog_item_id), None)
    if not item:
        raise HTTPException(404, "Тест не найден в каталоге")

    order = await crud.create_ready_quiz_order(session, user.id, item)
    await notify_admin_new_order(order, user, kind="ready_quiz")
    return order


@router.post("/order/custom", response_model=OrderOut)
async def order_custom_quiz(data: CreateCustomOrderIn, session: AsyncSession = Depends(get_session)):
    user = await crud.get_or_create_user(session, data.tg_id, data.username, data.full_name)
    order = await crud.create_custom_quiz_order(
        session,
        user_id=user.id,
        questions_file_url=data.questions_file_url,
        deadline=data.deadline,
        comment=data.comment,
        price=PRICE_CUSTOM_QUIZ,
    )
    await notify_admin_new_order(order, user, kind="custom_quiz")
    return order


@router.get("/order/{order_id}", response_model=OrderOut)
async def get_order_status(order_id: int, session: AsyncSession = Depends(get_session)):
    order = await crud.get_order(session, order_id)
    if not order:
        raise HTTPException(404, "Заказ не найден")
    return order
