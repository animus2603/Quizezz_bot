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


EXAMPLE_GOODS_LISTINGS = [
    dict(
        title="Учебник «Физика. Механика» (Иргафов)",
        description="Б/у, состояние хорошее, все страницы на месте, немного пометок карандашом",
        price=2500,
        subcategory="Учебники",
        category="goods",
        photo_urls=["https://picsum.photos/seed/studhub-book1/500/400"],
    ),
    dict(
        title="Ноутбук Lenovo IdeaPad 3",
        description="15.6\", 8GB RAM, SSD 256GB — для учёбы и не только. Продаю в связи с покупкой нового",
        price=145000,
        subcategory="Электроника",
        category="goods",
        photo_urls=["https://picsum.photos/seed/studhub-laptop1/500/400"],
    ),
    dict(
        title="Толстовка с логотипом университета",
        description="Размер M, почти новая, надевала пару раз",
        price=6000,
        subcategory="Одежда",
        category="goods",
        photo_urls=["https://picsum.photos/seed/studhub-hoodie1/500/400"],
    ),
]

EXAMPLE_STUDY_LISTINGS = [
    dict(
        title="Помогу с СРС по программированию",
        description="Пишу и оформляю самостоятельные работы по Python/Java — с объяснением, не просто копипаст",
        price=4000,
        subcategory="СРС",
        category="study",
        subject="Программирование",
        photo_urls=["https://picsum.photos/seed/studhub-code1/500/400"],
    ),
    dict(
        title="Готовые Quizizz по английскому языку",
        description="Есть база пройденных тестов по грамматике B1-B2, отвечу быстро",
        price=1500,
        subcategory="Quizizz",
        category="study",
        subject="Английский язык",
        photo_urls=["https://picsum.photos/seed/studhub-english1/500/400"],
    ),
    dict(
        title="Оформлю реферат по ГОСТу за 1 день",
        description="Титульный лист, содержание, список литературы — всё по требованиям вуза",
        price=3500,
        subcategory="Реферат",
        category="study",
        photo_urls=["https://picsum.photos/seed/studhub-essay1/500/400"],
    ),
]


async def init_db() -> None:
    """Создаёт таблицы, если их ещё нет, и добавляет примеры тестов/объявлений в пустую БД."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    from database.models import Listing, ListingCategory, ListingStatus
    from database import crud

    async with async_session() as session:
        result = await session.execute(select(QuizCatalogItem))
        if result.first() is None:
            for item in EXAMPLE_CATALOG:
                session.add(QuizCatalogItem(**item))
            await session.commit()

        listing_result = await session.execute(select(Listing))
        if listing_result.first() is None:
            demo_user = await crud.get_or_create_user(session, 0, "demo_seller", "Демо продавец")
            for item in EXAMPLE_GOODS_LISTINGS + EXAMPLE_STUDY_LISTINGS:
                listing = await crud.create_listing(
                    session,
                    seller_id=demo_user.id,
                    category=ListingCategory(item["category"]),
                    title=item["title"],
                    description=item["description"],
                    price=item["price"],
                    photo_file_id=None,
                    contact="@demo_seller",
                    subcategory=item.get("subcategory"),
                    subject=item.get("subject"),
                    photo_urls=item.get("photo_urls"),
                )
                await crud.set_listing_status(session, listing, ListingStatus.approved)


async def get_session() -> AsyncSession:
    async with async_session() as session:
        yield session
