from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.orm import Session


class BookingConflictError(Exception):
    pass


def assert_no_conflict(
    db: Session,
    room_id: UUID,
    start_at: datetime,
    end_at: datetime,
    buffer_before: int,
    buffer_after: int,
    booking_id: Optional[UUID] = None,
) -> None:
    query = text(
        """
        SELECT id
        FROM bookings
        WHERE room_id = :room_id
          AND status IN ('CONFIRMED', 'HELD')
          AND tstzrange(
                start_at - make_interval(mins => buffer_before),
                end_at + make_interval(mins => buffer_after),
                '[)'
              ) && tstzrange(
                :start_at - make_interval(mins => :buffer_before),
                :end_at + make_interval(mins => :buffer_after),
                '[)'
              )
          AND (:booking_id IS NULL OR id <> :booking_id)
        LIMIT 1
        """
    )
    conflict = db.execute(
        query,
        {
            "room_id": str(room_id),
            "start_at": start_at,
            "end_at": end_at,
            "buffer_before": buffer_before,
            "buffer_after": buffer_after,
            "booking_id": str(booking_id) if booking_id else None,
        },
    ).fetchone()
    if conflict:
        raise BookingConflictError("Room is not available for selected time")
