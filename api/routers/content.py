from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database.engine import get_session
from database import crud

router = APIRouter(prefix="/content", tags=["content"])


@router.get("")
async def get_public_content(session: AsyncSession = Depends(get_session)):
    """Контент Mini App из раздела «Настройки» админки: брендинг, баннеры, реклама, FAQ, поддержка."""
    app_settings = await crud.get_app_settings(session)
    support = await crud.get_support_settings(session)
    banners = await crud.get_banners(session)
    ads = await crud.get_advertisements(session)
    faq = await crud.get_faq(session)
    return {
        "app": {"name": app_settings.app_name, "icon": app_settings.app_icon},
        "banners": [
            {"id": b.id, "title": b.title, "description": b.description, "image_url": b.image_url, "link_url": b.link_url}
            for b in banners
        ],
        "ads": [
            {"id": a.id, "title": a.title, "description": a.description, "image_url": a.image_url, "link_url": a.link_url}
            for a in ads
        ],
        "faq": [{"id": f.id, "question": f.question, "answer": f.answer} for f in faq],
        "support": {
            "telegram": support.telegram,
            "whatsapp": support.whatsapp,
            "instagram": support.instagram,
            "tiktok": support.tiktok,
            "email": support.email,
        },
    }
