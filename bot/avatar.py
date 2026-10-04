import logging

from aiogram import Bot
from sqlalchemy.ext.asyncio import AsyncSession

from database import crud
from database.models import User

logger = logging.getLogger(__name__)


async def refresh_user_avatar(bot: Bot, session: AsyncSession, user: User) -> None:
    """Сохраняет file_id и file_path первой аватарки пользователя. Ошибки не пробрасывает."""
    try:
        photos = await bot.get_user_profile_photos(user.tg_id, limit=1)
        if not photos.total_count or not photos.photos:
            return
        largest = photos.photos[0][-1]
        if largest.file_id == user.avatar_file_id and user.avatar_file_path:
            return
        file = await bot.get_file(largest.file_id)
        await crud.set_user_avatar(session, user, largest.file_id, file.file_path)
    except Exception as e:
        logger.warning("Не удалось обновить аватар пользователя %s: %s", user.tg_id, e)
