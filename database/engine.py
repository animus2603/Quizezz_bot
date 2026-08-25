from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from config import DATABASE_URL
from database.models import Base, QuizCatalogItem

engine = create_async_engine(DATABASE_URL, echo=False)
async_session = async_sessionmaker(engine, expire_on_commit=False)

EXAMPLE_CATALOG = [
    dict(
        title="Математический анализ — Модуль 1",
        description="Пределы, производные, базовые теоремы",
        subject="Математика",
        course="1",
        faculty="Информационные технологии",
        department="Прикладная математика",
        file_url="https://example.com/quiz/math-1.pdf",
        price=3000,
    ),
    dict(
        title="История Казахстана — Тест 5",
        description="XIX-XX века, ключевые даты и личности",
        subject="История",
        course="1",
        faculty="Гуманитарный факультет",
        department="История и социология",
        file_url="https://example.com/quiz/history-5.pdf",
        price=3000,
    ),
    dict(
        title="English Grammar — Quiz B1",
        description="Времена, предлоги, условные предложения",
        subject="Английский язык",
        course="2",
        faculty="Иностранные языки",
        department="Кафедра иностранных языков",
        file_url="https://example.com/quiz/english-b1.pdf",
        price=3000,
    ),
]


async def init_db() -> None:
    """Создаёт таблицы, если их ещё нет, и добавляет примеры тестов в пустой каталог."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        result = await session.execute(select(QuizCatalogItem))
        if result.first() is None:
            for item in EXAMPLE_CATALOG:
                session.add(QuizCatalogItem(**item))
            await session.commit()


async def get_session() -> AsyncSession:
    async with async_session() as session:
        yield session
