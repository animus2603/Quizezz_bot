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
        group_name="ИС-21",
        faculty="Информационные технологии",
        department="Прикладная математика",
        file_url="https://example.com/quiz/math-1.pdf",
        price=3000,
        preview_text=(
            "1. Чему равен предел последовательности 1/n при n → ∞?\n"
            "2. Производная функции x² равна...\n"
            "3. Что такое точка перегиба функции?\n"
            "4. Сформулируйте теорему Лагранжа.\n"
            "5. Чему равен предел (sin x)/x при x → 0?\n"
            "6. Что называется критической точкой функции?\n"
            "7. Производная константы равна...\n"
            "8. Что такое асимптота графика функции?\n"
            "9. Сформулируйте правило Лопиталя.\n"
            "10. Как найти точки экстремума функции?"
        ),
    ),
    dict(
        title="История Казахстана — Тест 5",
        description="XIX-XX века, ключевые даты и личности",
        subject="История",
        course="1",
        group_name="ИС-21",
        faculty="Гуманитарный факультет",
        department="История и социология",
        file_url="https://example.com/quiz/history-5.pdf",
        price=3000,
        preview_text=(
            "1. В каком году произошло восстание Кенесары Касымова?\n"
            "2. Кто возглавлял Алаш Орду?\n"
            "3. Когда была провозглашена независимость Казахстана?\n"
            "4. Что такое Голощёкинский геноцид?\n"
            "5. Назовите первого Президента Казахстана.\n"
            "6. В каком году Казахстан вступил в ООН?\n"
            "7. Что такое Целинная эпопея?\n"
            "8. Когда была принята Конституция РК?\n"
            "9. Кто такой Абылай хан?\n"
            "10. Назовите столицы Казахстана в разные периоды истории."
        ),
    ),
    dict(
        title="English Grammar — Quiz B1",
        description="Времена, предлоги, условные предложения",
        subject="Английский язык",
        course="2",
        group_name="ИС-20",
        faculty="Иностранные языки",
        department="Кафедра иностранных языков",
        file_url="https://example.com/quiz/english-b1.pdf",
        price=3000,
        preview_text=(
            "1. Choose the correct form: I ___ (go) to school every day.\n"
            "2. What is the past simple of 'to write'?\n"
            "3. Fill the gap: If I ___ (be) you, I would study more.\n"
            "4. Choose the correct preposition: interested ___ music.\n"
            "5. What tense is used for finished actions with a result now?\n"
            "6. Choose the correct article: I saw ___ elephant at the zoo.\n"
            "7. What is the comparative form of 'good'?\n"
            "8. Fill the gap: She has ___ (live) here for 10 years.\n"
            "9. Choose the correct modal verb for advice.\n"
            "10. What is the plural of 'child'?"
        ),
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
