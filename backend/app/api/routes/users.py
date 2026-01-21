from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.routes.deps import get_current_user, get_db_session
from app.schemas.common import UserOut

router = APIRouter(tags=["users"])


@router.get("/me", response_model=UserOut)
def get_me(
    db: Session = Depends(get_db_session),
    user: dict = Depends(get_current_user),
):
    row = db.execute(text("SELECT * FROM users WHERE id = :id"), {"id": user["sub"]}).mappings().first()
    return UserOut(**row)
