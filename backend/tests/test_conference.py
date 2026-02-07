from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_terminal_config_contains_limits():
    response = client.get("/conference/terminal-config")
    assert response.status_code == 200
    payload = response.json()
    assert payload["max_files"] == 3
    assert "pptx" in payload["allowed_formats"]


def test_guest_session_flow():
    response = client.post(
        "/conference/sessions/guest",
        json={
            "full_name": "Guest Speaker",
            "email": "guest@example.com",
            "talk_title": "Emergency topic",
            "section": "Special",
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "needs_mapping"
    assert payload["session"]["speaker_code"].startswith("G")


def test_upload_validation_rejects_large_file():
    response = client.post(
        "/conference/uploads/validate",
        json={
            "filename": "EmergencyDeck.pptx",
            "size_mb": 1024,
            "extension": "pptx",
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["accepted"] is False
    assert payload["checks"]["size"] is False


def test_upload_token_generation():
    response = client.post("/conference/uploads/token")
    assert response.status_code == 200
    payload = response.json()
    assert payload["token"]
    assert payload["upload_url"].startswith("/conference/mobile-upload/")
