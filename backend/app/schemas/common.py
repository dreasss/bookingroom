from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field


class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str


class RoomOut(BaseModel):
    id: str
    name: str
    capacity: int
    equipment: dict
    photos: List[str] = []
    timezone: str
    status: str


class BookingCreate(BaseModel):
    room_id: str
    title: str
    start_at: datetime
    end_at: datetime
    recurrence_rule: Optional[str] = None
    buffer_before: int = Field(default=0, ge=0)
    buffer_after: int = Field(default=0, ge=0)
    attendees: List[EmailStr] = []


class BookingOut(BaseModel):
    id: str
    room_id: str
    organizer_id: str
    title: str
    start_at: datetime
    end_at: datetime
    status: str


class BookingPatch(BaseModel):
    title: Optional[str] = None
    start_at: Optional[datetime] = None
    end_at: Optional[datetime] = None
    buffer_before: Optional[int] = None
    buffer_after: Optional[int] = None
    recurrence_rule: Optional[str] = None


class NotificationOut(BaseModel):
    id: str
    type: str
    status: str
    scheduled_at: Optional[datetime] = None
    sent_at: Optional[datetime] = None
