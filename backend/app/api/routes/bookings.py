from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.routes.deps import get_current_user, get_db_session
from app.schemas.common import BookingCreate, BookingOut, BookingPatch
from app.services.booking_service import BookingConflictError, assert_no_conflict

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("", response_model=BookingOut)
def create_booking(
    payload: BookingCreate,
    db: Session = Depends(get_db_session),
    user: dict = Depends(get_current_user),
):
    try:
        assert_no_conflict(
            db,
            room_id=payload.room_id,
            start_at=payload.start_at,
            end_at=payload.end_at,
            buffer_before=payload.buffer_before,
            buffer_after=payload.buffer_after,
        )
    except BookingConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc

    insert = text(
        """
        INSERT INTO bookings (room_id, organizer_id, title, start_at, end_at, recurrence_rule, buffer_before, buffer_after, status, created_at)
        VALUES (:room_id, :organizer_id, :title, :start_at, :end_at, :recurrence_rule, :buffer_before, :buffer_after, 'CONFIRMED', now())
        RETURNING *
        """
    )
    row = db.execute(
        insert,
        {
            "room_id": payload.room_id,
            "organizer_id": user["sub"],
            "title": payload.title,
            "start_at": payload.start_at,
            "end_at": payload.end_at,
            "recurrence_rule": payload.recurrence_rule,
            "buffer_before": payload.buffer_before,
            "buffer_after": payload.buffer_after,
        },
    ).mappings().first()
    db.commit()
    return BookingOut(**row)


@router.get("", response_model=list[BookingOut])
def list_bookings(
    from_dt: datetime | None = Query(default=None, alias="from"),
    to_dt: datetime | None = Query(default=None, alias="to"),
    room_id: str | None = Query(default=None),
    mine: bool = Query(default=False),
    db: Session = Depends(get_db_session),
    user: dict = Depends(get_current_user),
):
    query = "SELECT * FROM bookings WHERE 1=1"
    params = {}
    if from_dt:
        query += " AND end_at >= :from_dt"
        params["from_dt"] = from_dt
    if to_dt:
        query += " AND start_at <= :to_dt"
        params["to_dt"] = to_dt
    if room_id:
        query += " AND room_id = :room_id"
        params["room_id"] = room_id
    if mine:
        query += " AND organizer_id = :organizer_id"
        params["organizer_id"] = user["sub"]
    rows = db.execute(text(query), params).mappings().all()
    return [BookingOut(**row) for row in rows]


@router.patch("/{booking_id}", response_model=BookingOut)
def update_booking(
    booking_id: str,
    payload: BookingPatch,
    db: Session = Depends(get_db_session),
    user: dict = Depends(get_current_user),
):
    existing = db.execute(text("SELECT * FROM bookings WHERE id = :id"), {"id": booking_id}).mappings().first()
    if not existing:
        raise HTTPException(status_code=404, detail="Booking not found")
    if existing["organizer_id"] != user["sub"]:
        raise HTTPException(status_code=403, detail="Forbidden")

    start_at = payload.start_at or existing["start_at"]
    end_at = payload.end_at or existing["end_at"]
    buffer_before = payload.buffer_before if payload.buffer_before is not None else existing["buffer_before"]
    buffer_after = payload.buffer_after if payload.buffer_after is not None else existing["buffer_after"]

    try:
        assert_no_conflict(
            db,
            room_id=existing["room_id"],
            start_at=start_at,
            end_at=end_at,
            buffer_before=buffer_before,
            buffer_after=buffer_after,
            booking_id=booking_id,
        )
    except BookingConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc

    update = text(
        """
        UPDATE bookings
        SET title = COALESCE(:title, title),
            start_at = COALESCE(:start_at, start_at),
            end_at = COALESCE(:end_at, end_at),
            buffer_before = COALESCE(:buffer_before, buffer_before),
            buffer_after = COALESCE(:buffer_after, buffer_after),
            recurrence_rule = COALESCE(:recurrence_rule, recurrence_rule)
        WHERE id = :id
        RETURNING *
        """
    )
    row = db.execute(
        update,
        {
            "id": booking_id,
            "title": payload.title,
            "start_at": payload.start_at,
            "end_at": payload.end_at,
            "buffer_before": payload.buffer_before,
            "buffer_after": payload.buffer_after,
            "recurrence_rule": payload.recurrence_rule,
        },
    ).mappings().first()
    db.commit()
    return BookingOut(**row)


@router.post("/{booking_id}/cancel", response_model=BookingOut)
def cancel_booking(
    booking_id: str,
    db: Session = Depends(get_db_session),
    user: dict = Depends(get_current_user),
):
    existing = db.execute(text("SELECT * FROM bookings WHERE id = :id"), {"id": booking_id}).mappings().first()
    if not existing:
        raise HTTPException(status_code=404, detail="Booking not found")
    if existing["organizer_id"] != user["sub"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    row = db.execute(
        text("UPDATE bookings SET status = 'CANCELLED' WHERE id = :id RETURNING *"),
        {"id": booking_id},
    ).mappings().first()
    db.commit()
    return BookingOut(**row)


@router.post("/{booking_id}/checkin")
def checkin_booking(
    booking_id: str,
    db: Session = Depends(get_db_session),
):
    existing = db.execute(text("SELECT * FROM bookings WHERE id = :id"), {"id": booking_id}).mappings().first()
    if not existing:
        raise HTTPException(status_code=404, detail="Booking not found")
    db.execute(
        text("INSERT INTO checkins (booking_id, checked_in_at, method) VALUES (:id, now(), 'QR')"),
        {"id": booking_id},
    )
    db.commit()
    return {"status": "checked_in"}
