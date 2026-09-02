import enum
import datetime as dt

from sqlalchemy import (
    String, Integer, BigInteger, Text, DateTime, Enum, ForeignKey, Boolean
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    tg_id: Mapped[int] = mapped_column(BigInteger, unique=True, index=True)
    username: Mapped[str | None] = mapped_column(String(64), nullable=True)
    full_name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(32), nullable=True)
    referred_by: Mapped[int | None] = mapped_column(BigInteger, nullable=True)  # tg_id пригласившего
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, default=dt.datetime.utcnow)

    orders: Mapped[list["Order"]] = relationship(back_populates="user")
    listings: Mapped[list["Listing"]] = relationship(back_populates="seller")


# ---------- Quizizz ----------

class QuizCatalogItem(Base):
    """Готовые тесты, лежащие в каталоге по фиксированной цене."""
    __tablename__ = "quiz_catalog"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    subject: Mapped[str | None] = mapped_column(String(128), nullable=True)  # предмет/дисциплина
    course: Mapped[str | None] = mapped_column(String(64), nullable=True)
    group_name: Mapped[str | None] = mapped_column(String(64), nullable=True)
    faculty: Mapped[str | None] = mapped_column(String(128), nullable=True)
    department: Mapped[str | None] = mapped_column(String(128), nullable=True)
    file_url: Mapped[str] = mapped_column(Text)  # ссылка на файл с ответами/доступ
    preview_text: Mapped[str | None] = mapped_column(Text, nullable=True)  # пример 10-20 вопросов для просмотра
    price: Mapped[int] = mapped_column(Integer, default=3000)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, default=dt.datetime.utcnow)


class OrderType(str, enum.Enum):
    ready_quiz = "ready_quiz"       # покупка готового теста из каталога (3000)
    custom_quiz = "custom_quiz"     # индивидуальный заказ (5000)


class OrderStatus(str, enum.Enum):
    awaiting_payment = "awaiting_payment"   # ждём чек от студента
    payment_review = "payment_review"       # чек прислан, ждёт подтверждения админом
    in_progress = "in_progress"             # В обработке (для custom_quiz)
    done = "done"                           # Готово
    sent = "sent"                           # Отправлено студенту
    rejected = "rejected"                   # чек отклонён
    cancelled = "cancelled"                 # отменён самим клиентом (в течение часа)


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    order_type: Mapped[OrderType] = mapped_column(Enum(OrderType))
    status: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus), default=OrderStatus.awaiting_payment)

    # для ready_quiz
    catalog_item_id: Mapped[int | None] = mapped_column(ForeignKey("quiz_catalog.id"), nullable=True)

    # для custom_quiz
    questions_file_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    deadline: Mapped[dt.datetime | None] = mapped_column(DateTime, nullable=True)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)

    price: Mapped[int] = mapped_column(Integer)
    receipt_file_id: Mapped[str | None] = mapped_column(String(255), nullable=True)  # telegram file_id чека
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[dt.datetime] = mapped_column(DateTime, default=dt.datetime.utcnow)
    updated_at: Mapped[dt.datetime] = mapped_column(DateTime, default=dt.datetime.utcnow, onupdate=dt.datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="orders")
    catalog_item: Mapped["QuizCatalogItem"] = relationship()


# ---------- Маркетплейс ----------

class ListingCategory(str, enum.Enum):
    study = "study"    # учебное: Quizizz, СРС, рефераты, доклады, шпаргалки и т.д.
    goods = "goods"     # товары: всё, что угодно


class ListingStatus(str, enum.Enum):
    pending = "pending"      # на модерации
    approved = "approved"    # опубликовано
    rejected = "rejected"    # отклонено
    sold = "sold"             # продано


class Listing(Base):
    __tablename__ = "listings"

    id: Mapped[int] = mapped_column(primary_key=True)
    seller_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    category: Mapped[ListingCategory] = mapped_column(Enum(ListingCategory))
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    price: Mapped[int | None] = mapped_column(Integer, nullable=True)
    photo_file_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    attachment_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    photo_urls: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON-список URL нескольких фото
    contact: Mapped[str] = mapped_column(String(255))  # @username или ссылка
    subcategory: Mapped[str | None] = mapped_column(String(64), nullable=True)  # Quizizz, СРС, Учебники и т.д.

    # академические фильтры — заполняются продавцом опционально
    course: Mapped[str | None] = mapped_column(String(64), nullable=True)
    group_name: Mapped[str | None] = mapped_column(String(64), nullable=True)
    faculty: Mapped[str | None] = mapped_column(String(128), nullable=True)
    department: Mapped[str | None] = mapped_column(String(128), nullable=True)
    subject: Mapped[str | None] = mapped_column(String(128), nullable=True)

    status: Mapped[ListingStatus] = mapped_column(Enum(ListingStatus), default=ListingStatus.pending)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, default=dt.datetime.utcnow)

    seller: Mapped["User"] = relationship(back_populates="listings")


class ListingComment(Base):
    """Комментарии под объявлением в маркетплейсе."""
    __tablename__ = "listing_comments"

    id: Mapped[int] = mapped_column(primary_key=True)
    listing_id: Mapped[int] = mapped_column(ForeignKey("listings.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    text: Mapped[str] = mapped_column(Text)
    rating: Mapped[int | None] = mapped_column(Integer, nullable=True)  # 1-5 звёзд, опционально
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, default=dt.datetime.utcnow)

    user: Mapped["User"] = relationship()
