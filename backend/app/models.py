from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base
import uuid

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False, default="EMPLOYEE")
    org_unit = Column(String)
    created_at = Column(DateTime(timezone=True), nullable=False)


class Room(Base):
    __tablename__ = "rooms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    location_id = Column(UUID(as_uuid=True), ForeignKey("locations.id"))
    name = Column(String, nullable=False)
    capacity = Column(Integer, nullable=False)
    equipment = Column(JSON, nullable=False, default=dict)
    photos = Column(JSON, nullable=False, default=list)
    timezone = Column(String, nullable=False, default="Europe/Berlin")
    status = Column(String, nullable=False, default="ACTIVE")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    room_id = Column(UUID(as_uuid=True), ForeignKey("rooms.id"), nullable=False)
    organizer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    start_at = Column(DateTime(timezone=True), nullable=False)
    end_at = Column(DateTime(timezone=True), nullable=False)
    recurrence_rule = Column(Text)
    buffer_before = Column(Integer, nullable=False, default=0)
    buffer_after = Column(Integer, nullable=False, default=0)
    status = Column(String, nullable=False, default="CONFIRMED")
    created_at = Column(DateTime(timezone=True), nullable=False)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    email = Column(String)
    type = Column(String, nullable=False)
    payload = Column(JSON, nullable=False)
    status = Column(String, nullable=False, default="PENDING")
    scheduled_at = Column(DateTime(timezone=True))
    sent_at = Column(DateTime(timezone=True))


class AnalyticsDaily(Base):
    __tablename__ = "analytics_daily"

    date = Column(Date, primary_key=True)
    room_id = Column(UUID(as_uuid=True), ForeignKey("rooms.id"), primary_key=True)
    minutes_booked = Column(Integer, nullable=False, default=0)
    no_show_count = Column(Integer, nullable=False, default=0)
    cancel_count = Column(Integer, nullable=False, default=0)
