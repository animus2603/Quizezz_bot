import datetime as dt
from pydantic import BaseModel, field_validator

MIN_DEADLINE_HOURS = 24


class CatalogItemOut(BaseModel):
    id: int
    title: str
    description: str | None
    subject: str | None
    course: str | None = None
    faculty: str | None = None
    department: str | None = None
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

    @field_validator("deadline")
    @classmethod
    def deadline_min_lead_time(cls, value: dt.datetime) -> dt.datetime:
        now = dt.datetime.now(value.tzinfo) if value.tzinfo else dt.datetime.utcnow()
        min_allowed = now + dt.timedelta(hours=MIN_DEADLINE_HOURS)
        if value < min_allowed:
            raise ValueError(f"Дедлайн должен быть минимум через {MIN_DEADLINE_HOURS} часов")
        return value


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
    title: str | None = None
    subject: str | None = None
    course: str | None = None
    faculty: str | None = None
    department: str | None = None
    can_cancel: bool = False
    cancel_seconds_left: int = 0

    class Config:
        from_attributes = True


class CancelOrderIn(BaseModel):
    tg_id: int


class FilterOptionsOut(BaseModel):
    options: list[str]


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
    subcategory: str | None = None
    course: str | None = None
    group_name: str | None = None
    faculty: str | None = None
    department: str | None = None
    subject: str | None = None
    attachment_url: str | None = None

    class Config:
        from_attributes = True


class CreateListingIn(BaseModel):
    tg_id: int
    username: str | None = None
    full_name: str | None = None
    category: str  # study | goods
    title: str
    description: str | None = None
    price: int | None = None
    contact: str
    photo_file_id: str | None = None
    attachment_url: str | None = None
    subcategory: str | None = None
    course: str | None = None
    group_name: str | None = None
    faculty: str | None = None
    department: str | None = None
    subject: str | None = None
