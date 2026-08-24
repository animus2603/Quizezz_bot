import datetime as dt
from pydantic import BaseModel


class CatalogItemOut(BaseModel):
    id: int
    title: str
    description: str | None
    subject: str | None
    price: int

    class Config:
        from_attributes = True


class CreateReadyOrderIn(BaseModel):
    tg_id: int
    username: str | None = None
    full_name: str | None = None
    catalog_item_id: int


class CreateCustomOrderIn(BaseModel):
    tg_id: int
    username: str | None = None
    full_name: str | None = None
    questions_file_url: str | None = None
    deadline: dt.datetime
    comment: str | None = None


class OrderOut(BaseModel):
    id: int
    order_type: str
    status: str
    price: int

    class Config:
        from_attributes = True


class ProfileOut(BaseModel):
    tg_id: int
    username: str | None
    full_name: str | None
    phone: str | None

    class Config:
        from_attributes = True


class ProfileIn(BaseModel):
    tg_id: int
    username: str | None = None
    full_name: str | None = None


class UserOrderOut(BaseModel):
    id: int
    order_type: str
    status: str
    price: int
    created_at: dt.datetime

    class Config:
        from_attributes = True


class UserListingOut(BaseModel):
    id: int
    category: str
    title: str
    price: int | None
    status: str
    created_at: dt.datetime

    class Config:
        from_attributes = True


class ListingOut(BaseModel):
    id: int
    category: str
    title: str
    description: str | None
    price: int | None
    contact: str

    class Config:
        from_attributes = True


class CreateListingIn(BaseModel):
    tg_id: int
    username: str | None = None
    full_name: str | None = None
    category: str  # goods | services | ads
    title: str
    description: str | None = None
    price: int | None = None
    contact: str
    photo_file_id: str | None = None
