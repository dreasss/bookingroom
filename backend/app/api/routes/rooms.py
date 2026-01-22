from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.routes.deps import get_db_session
from app.schemas.common import RoomOut

router = APIRouter(prefix="/rooms", tags=["rooms"])


@router.get("", response_model=list[RoomOut])
def list_rooms(
    capacity: int | None = Query(default=None),
    equipment: str | None = Query(default=None),
    location: str | None = Query(default=None),
    db: Session = Depends(get_db_session),
):
    query = "SELECT * FROM rooms WHERE status = 'ACTIVE'"
    params = {}
    if capacity:
        query += " AND capacity >= :capacity"
        params["capacity"] = capacity
    if location:
        query += " AND location_id = :location"
        params["location"] = location
    if equipment:
        query += " AND equipment ? :equipment"
        params["equipment"] = equipment
    rows = db.execute(text(query), params).mappings().all()
    return [RoomOut(**row) for row in rows]


@router.get("/{room_id}", response_model=RoomOut)
def get_room(room_id: str, db: Session = Depends(get_db_session)):
    row = db.execute(text("SELECT * FROM rooms WHERE id = :id"), {"id": room_id}).mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Room not found")
    return RoomOut(**row)
