from datetime import datetime
from typing import Dict


def render_booking_email(template: str, context: Dict) -> str:
    if template == "created":
        return (
            f"Ваше бронирование подтверждено: {context['title']}\n"
            f"Комната: {context['room']}\n"
            f"Когда: {context['start_at']} - {context['end_at']}"
        )
    if template == "cancelled":
        return f"Бронирование отменено: {context['title']}"
    if template == "reminder":
        return f"Напоминание о встрече: {context['title']}"
    return ""


def build_notification_payload(
    event_type: str,
    booking_id: str,
    room_name: str,
    start_at: datetime,
    end_at: datetime,
) -> Dict:
    return {
        "event_type": event_type,
        "booking_id": booking_id,
        "room": room_name,
        "start_at": start_at.isoformat(),
        "end_at": end_at.isoformat(),
    }
