from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.routes.deps import get_db_session, require_admin

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


@router.post("/rooms")
def create_room(payload: dict, db: Session = Depends(get_db_session)):
    row = db.execute(
        text(
            """
            INSERT INTO rooms (name, capacity, equipment, photos, timezone, status, location_id)
            VALUES (:name, :capacity, :equipment, :photos, :timezone, :status, :location_id)
            RETURNING *
            """
        ),
        {
            "name": payload.get("name"),
            "capacity": payload.get("capacity"),
            "equipment": payload.get("equipment", {}),
            "photos": payload.get("photos", []),
            "timezone": payload.get("timezone", "Europe/Berlin"),
            "status": payload.get("status", "ACTIVE"),
            "location_id": payload.get("location_id"),
        },
    ).mappings().first()
    db.commit()
    return row


@router.put("/rooms/{room_id}")
def update_room(room_id: str, payload: dict, db: Session = Depends(get_db_session)):
    row = db.execute(
        text(
            """
            UPDATE rooms
            SET name = COALESCE(:name, name),
                capacity = COALESCE(:capacity, capacity),
                equipment = COALESCE(:equipment, equipment),
                photos = COALESCE(:photos, photos),
                timezone = COALESCE(:timezone, timezone),
                status = COALESCE(:status, status),
                location_id = COALESCE(:location_id, location_id)
            WHERE id = :id
            RETURNING *
            """
        ),
        {
            "id": room_id,
            "name": payload.get("name"),
            "capacity": payload.get("capacity"),
            "equipment": payload.get("equipment"),
            "photos": payload.get("photos"),
            "timezone": payload.get("timezone"),
            "status": payload.get("status"),
            "location_id": payload.get("location_id"),
        },
    ).mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Room not found")
    db.commit()
    return row


@router.delete("/rooms/{room_id}")
def delete_room(room_id: str, db: Session = Depends(get_db_session)):
    row = db.execute(text("DELETE FROM rooms WHERE id = :id RETURNING id"), {"id": room_id}).mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Room not found")
    db.commit()
    return {"status": "deleted"}


@router.post("/rules")
def set_rules(payload: dict):
    return {"status": "ok", "rules": payload}


@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db_session)):
    rows = db.execute(text("SELECT * FROM analytics_daily ORDER BY date DESC LIMIT 30")).mappings().all()
    return rows
