from datetime import datetime

from app.services.notifications import build_notification_payload, render_booking_email


def test_build_notification_payload():
    payload = build_notification_payload(
        event_type="created",
        booking_id="b1",
        room_name="Atlas",
        start_at=datetime(2025, 1, 1, 9, 0),
        end_at=datetime(2025, 1, 1, 10, 0),
    )
    assert payload["event_type"] == "created"
    assert payload["booking_id"] == "b1"
    assert payload["room"] == "Atlas"


def test_render_booking_email_created():
    body = render_booking_email(
        "created",
        {
            "title": "Sync",
            "room": "Atlas",
            "start_at": "2025-01-01 09:00",
            "end_at": "2025-01-01 10:00",
        },
    )
    assert "Sync" in body
