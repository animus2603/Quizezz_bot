from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from database.engine import get_session
from database import crud
from database.models import ListingCategory
from api.schemas import (
    ListingOut, CreateListingIn, UpdateListingIn, DeleteListingIn, FilterOptionsOut,
    CommentOut, CreateCommentIn, UpdateCommentIn, DeleteCommentIn,
)
from bot.notify import notify_admin_new_listing, notify_client_listing_submitted, notify_seller_new_review

router = APIRouter(prefix="/marketplace", tags=["marketplace"])


def _listing_out(listing, seller_name: str | None = None) -> ListingOut:
    out = ListingOut.model_validate(listing)
    out.seller_name = seller_name
    return out


@router.get("/listings", response_model=list[ListingOut])
async def list_listings(
    category: str | None = None,
    subcategory: str | None = None,
    course: str | None = None,
    group_name: str | None = None,
    faculty: str | None = None,
    department: str | None = None,
    subject: str | None = None,
    session: AsyncSession = Depends(get_session),
):
    cat = ListingCategory(category) if category else None
    return await crud.get_approved_listings(
        session, cat, subcategory, course, group_name, faculty, department, subject
    )


@router.get("/listings/{listing_id}", response_model=ListingOut)
async def get_listing_detail(listing_id: int, session: AsyncSession = Depends(get_session)):
    result = await crud.get_listing_with_seller(session, listing_id)
    if not result:
        raise HTTPException(404, "Объявление не найдено")
    listing, seller = result
    return _listing_out(listing, seller.full_name or seller.username or "Продавец")


@router.get("/listings/{listing_id}/similar", response_model=list[ListingOut])
async def get_similar(listing_id: int, session: AsyncSession = Depends(get_session)):
    listing = await crud.get_listing(session, listing_id)
    if not listing:
        raise HTTPException(404, "Объявление не найдено")
    similar = await crud.get_similar_listings(session, listing)
    return similar


@router.get("/listings/{listing_id}/comments", response_model=list[CommentOut])
async def get_comments(listing_id: int, session: AsyncSession = Depends(get_session)):
    pairs = await crud.get_listing_comments(session, listing_id)
    return [
        CommentOut(
            id=c.id, text=c.text,
            author_name=u.full_name or (f"@{u.username}" if u.username else "Студент"),
            author_tg_id=u.tg_id,
            rating=c.rating,
            created_at=c.created_at,
        )
        for c, u in pairs
    ]


@router.post("/listings/{listing_id}/comments", response_model=CommentOut)
async def post_comment(listing_id: int, data: CreateCommentIn, session: AsyncSession = Depends(get_session)):
    result = await crud.get_listing_with_seller(session, listing_id)
    if not result:
        raise HTTPException(404, "Объявление не найдено")
    listing, seller = result
    if not data.text.strip():
        raise HTTPException(400, "Комментарий не может быть пустым")

    rating = data.rating if data.rating and 1 <= data.rating <= 5 else None

    user = await crud.get_or_create_user(session, data.tg_id, data.username, data.full_name)
    comment = await crud.add_listing_comment(session, listing_id, user.id, data.text.strip(), rating)

    reviewer_name = user.full_name or (f"@{user.username}" if user.username else "Студент")
    await notify_seller_new_review(listing, seller, reviewer_name, comment.text, comment.rating)

    return CommentOut(
        id=comment.id, text=comment.text,
        author_name=reviewer_name,
        author_tg_id=user.tg_id,
        rating=comment.rating,
        created_at=comment.created_at,
    )


@router.put("/comments/{comment_id}", response_model=CommentOut)
async def edit_comment(comment_id: int, data: UpdateCommentIn, session: AsyncSession = Depends(get_session)):
    pair = await crud.get_comment_with_author(session, comment_id)
    if not pair:
        raise HTTPException(404, "Отзыв не найден")
    comment, author = pair
    if author.tg_id != data.tg_id:
        raise HTTPException(403, "Это не ваш отзыв")
    if not data.text.strip():
        raise HTTPException(400, "Комментарий не может быть пустым")

    rating = data.rating if data.rating and 1 <= data.rating <= 5 else None
    comment = await crud.update_comment(session, comment, data.text.strip(), rating)

    return CommentOut(
        id=comment.id, text=comment.text,
        author_name=author.full_name or (f"@{author.username}" if author.username else "Студент"),
        author_tg_id=author.tg_id,
        rating=comment.rating,
        created_at=comment.created_at,
    )


@router.delete("/comments/{comment_id}")
async def remove_comment(comment_id: int, data: DeleteCommentIn, session: AsyncSession = Depends(get_session)):
    pair = await crud.get_comment_with_author(session, comment_id)
    if not pair:
        raise HTTPException(404, "Отзыв не найден")
    comment, author = pair
    if author.tg_id != data.tg_id:
        raise HTTPException(403, "Это не ваш отзыв")

    await crud.delete_comment(session, comment)
    return {"ok": True}


@router.get("/filter-options/{field}", response_model=FilterOptionsOut)
async def filter_options(
    field: str,
    q: str = "",
    category: str | None = None,
    faculty: str | None = None,
    department: str | None = None,
    course: str | None = None,
    group_name: str | None = None,
    session: AsyncSession = Depends(get_session),
):
    """Автокомплит для попапа фильтра/формы: значения поля (+ примеры), с учётом
    выбранной категории и каскадной зависимости факультет → кафедра → курс → группа → предмет."""
    options = await crud.search_listing_filter_options(
        session, field, q, category, faculty, department, course, group_name
    )
    return FilterOptionsOut(options=options)


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
        subcategory=data.subcategory,
        course=data.course,
        group_name=data.group_name,
        faculty=data.faculty,
        department=data.department,
        subject=data.subject,
        attachment_url=data.attachment_url,
        photo_urls=data.photo_urls,
        expires_at=data.expires_at,
    )
    await notify_admin_new_listing(listing, user)
    await notify_client_listing_submitted(listing, user)
    return listing


@router.put("/listings/{listing_id}", response_model=ListingOut)
async def edit_listing(listing_id: int, data: UpdateListingIn, session: AsyncSession = Depends(get_session)):
    listing = await crud.get_listing(session, listing_id)
    if not listing:
        raise HTTPException(404, "Объявление не найдено")

    user = await crud.get_user_by_tg_id(session, data.tg_id)
    if not user or listing.seller_id != user.id:
        raise HTTPException(403, "Это не ваше объявление")

    update_fields = data.model_dump(exclude={"tg_id", "photo_urls"})
    if data.photo_urls is not None:
        import json
        update_fields["photo_urls"] = json.dumps(data.photo_urls)

    listing = await crud.update_listing(session, listing, **update_fields)
    return listing


@router.delete("/listings/{listing_id}")
async def remove_listing(listing_id: int, data: DeleteListingIn, session: AsyncSession = Depends(get_session)):
    listing = await crud.get_listing(session, listing_id)
    if not listing:
        raise HTTPException(404, "Объявление не найдено")

    user = await crud.get_user_by_tg_id(session, data.tg_id)
    if not user or listing.seller_id != user.id:
        raise HTTPException(403, "Это не ваше объявление")

    await crud.delete_listing(session, listing_id)
    return {"ok": True}
