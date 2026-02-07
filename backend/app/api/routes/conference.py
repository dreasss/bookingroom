from datetime import datetime, timedelta, timezone
from typing import List, Literal, Optional
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/conference", tags=["conference"])

AllowedFormat = Literal["ppt", "pptx", "pdf", "key", "mp4", "zip"]
UploadSource = Literal["usb", "phone_qr", "airdrop"]
UploadStatus = Literal["queued", "validating", "accepted", "needs_mapping", "rejected"]


class BrandKit(BaseModel):
    conference_name: str = "Future Science Forum 2026"
    dates: str = "12-14 Oct 2026"
    slogan: str = "Upload once, present confidently"
    help_desk: str = "+7 (900) 123-45-67"
    primary_color: str = "#5b21b6"
    secondary_color: str = "#06b6d4"
    mode: Literal["strict", "event"] = "event"


class SessionItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    speaker_name: str
    organization: str
    title: str
    section: str
    hall: str
    slot_time: str
    speaker_code: str


class GuestSubmission(BaseModel):
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    talk_title: str
    section: str
    slot_time: Optional[str] = None


class UploadRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    session_id: Optional[str] = None
    speaker_name: str
    title: str
    filename: str
    size_mb: float
    status: UploadStatus = "queued"
    version: int = 1
    source: UploadSource = "phone_qr"
    submitted_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    is_current: bool = True


class UploadValidationRequest(BaseModel):
    filename: str
    size_mb: float
    extension: AllowedFormat
    session_id: Optional[str] = None


class TerminalInfo(BaseModel):
    id: str
    name: str
    location: str
    online: bool
    app_version: str
    disk_free_gb: int
    last_seen_at: str


class UploadTokenResponse(BaseModel):
    token: str
    expires_at: str
    upload_url: str


class ConferenceRules(BaseModel):
    max_size_mb: int = 512
    max_files: int = 3
    deadline_hours_before_slot: int = 2
    allowed_formats: List[AllowedFormat] = ["ppt", "pptx", "pdf", "key", "mp4", "zip"]


BRAND = BrandKit()
RULES = ConferenceRules()
SESSIONS: List[SessionItem] = [
    SessionItem(
        speaker_name="Анна Иванова",
        organization="ИТМО",
        title="LLM в научных публикациях",
        section="AI & Data",
        hall="A",
        slot_time="2026-10-12 14:30",
        speaker_code="AI7421",
    ),
    SessionItem(
        speaker_name="Павел Смирнов",
        organization="Cloud Lab",
        title="Edge инфраструктура 2026",
        section="Cloud",
        hall="B",
        slot_time="2026-10-12 15:00",
        speaker_code="CL5520",
    ),
]
UPLOADS: List[UploadRecord] = [
    UploadRecord(
        session_id=SESSIONS[0].id,
        speaker_name=SESSIONS[0].speaker_name,
        title=SESSIONS[0].title,
        filename="AI_Data_Ivanova_v2.pptx",
        size_mb=42.6,
        status="accepted",
        version=2,
        source="usb",
    )
]
TERMINALS: List[TerminalInfo] = [
    TerminalInfo(
        id="T-01",
        name="Регистрация A",
        location="Главный холл",
        online=True,
        app_version="1.4.2",
        disk_free_gb=87,
        last_seen_at=datetime.now(timezone.utc).isoformat(),
    ),
    TerminalInfo(
        id="T-02",
        name="Регистрация B",
        location="Вход 2",
        online=False,
        app_version="1.4.1",
        disk_free_gb=32,
        last_seen_at=(datetime.now(timezone.utc) - timedelta(minutes=14)).isoformat(),
    ),
]


def _session_by_id(session_id: Optional[str]) -> Optional[SessionItem]:
    if not session_id:
        return None
    return next((item for item in SESSIONS if item.id == session_id), None)


@router.get("/terminal-config")
def terminal_config():
    return {
        "brand": BRAND,
        "allowed_formats": RULES.allowed_formats,
        "max_size_mb": RULES.max_size_mb,
        "max_files": RULES.max_files,
        "deadline_policy": f"warn_before_{RULES.deadline_hours_before_slot}h",
        "languages": ["RU", "EN"],
    }


@router.get("/sessions")
def list_sessions(search: Optional[str] = None):
    if not search:
        return SESSIONS
    token = search.lower().strip()
    return [
        item
        for item in SESSIONS
        if token in item.speaker_name.lower() or token in item.organization.lower() or token in item.speaker_code.lower()
    ]


@router.get("/sessions/by-code/{speaker_code}")
def get_session_by_code(speaker_code: str):
    for item in SESSIONS:
        if item.speaker_code.lower() == speaker_code.lower():
            return item
    raise HTTPException(status_code=404, detail="Session not found")


@router.post("/sessions/guest")
def create_guest_session(payload: GuestSubmission):
    guest = SessionItem(
        speaker_name=payload.full_name,
        organization="Guest",
        title=payload.talk_title,
        section=payload.section,
        hall="TBD",
        slot_time=payload.slot_time or "TBD",
        speaker_code=f"G{uuid4().hex[:6].upper()}",
    )
    SESSIONS.append(guest)
    return {"status": "needs_mapping", "session": guest}


@router.post("/uploads/validate")
def validate_upload(payload: UploadValidationRequest):
    checks = {
        "format": payload.extension in RULES.allowed_formats,
        "size": payload.size_mb <= RULES.max_size_mb,
        "filename": len(payload.filename) >= 5 and " " not in payload.filename,
        "deadline": True,
    }
    slot_warning = None
    matched_session = _session_by_id(payload.session_id)
    if matched_session and matched_session.slot_time != "TBD":
        checks["deadline"] = True
        slot_warning = f"Session slot: {matched_session.slot_time}"

    accepted = all(checks.values())
    return {
        "accepted": accepted,
        "checks": checks,
        "preview_status": "queued" if accepted else "skipped",
        "antivirus_status": "queued" if accepted else "skipped",
        "message": "ready_for_upload" if accepted else "validation_failed",
        "slot_warning": slot_warning,
    }


@router.post("/uploads/token", response_model=UploadTokenResponse)
def create_upload_token():
    token = uuid4().hex
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    return UploadTokenResponse(
        token=token,
        expires_at=expires_at.isoformat(),
        upload_url=f"/conference/mobile-upload/{token}",
    )


@router.post("/uploads")
def create_upload(record: UploadRecord):
    history = [item for item in UPLOADS if item.session_id == record.session_id]
    version = len(history) + 1
    for item in history:
        item.is_current = False

    record.version = version
    record.status = "accepted" if record.status == "queued" else record.status
    record.is_current = True
    UPLOADS.append(record)
    return {"status": "accepted", "upload": record, "confirmation_code": uuid4().hex[:8].upper()}


@router.get("/uploads")
def list_uploads(status: Optional[UploadStatus] = None):
    if not status:
        return UPLOADS
    return [item for item in UPLOADS if item.status == status]


@router.get("/dashboard")
def dashboard():
    problematic = [item for item in UPLOADS if item.status in {"needs_mapping", "rejected"}]
    return {
        "submitted_today": len(UPLOADS),
        "total_uploads": len(UPLOADS),
        "problematic": len(problematic),
        "online_terminals": len([item for item in TERMINALS if item.online]),
        "terminals_total": len(TERMINALS),
        "latest_uploads": UPLOADS[-20:],
    }


@router.get("/terminals")
def list_terminals():
    return TERMINALS


@router.put("/brand")
def update_brand(payload: BrandKit):
    global BRAND
    BRAND = payload
    return {"status": "updated", "brand": BRAND}


@router.put("/rules")
def update_rules(payload: ConferenceRules):
    global RULES
    RULES = payload
    return {"status": "updated", "rules": RULES}
