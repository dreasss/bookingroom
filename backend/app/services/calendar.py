from typing import Dict


class CalendarAdapter:
    provider: str

    def create_event(self, payload: Dict) -> str:
        raise NotImplementedError

    def update_event(self, external_id: str, payload: Dict) -> None:
        raise NotImplementedError

    def delete_event(self, external_id: str) -> None:
        raise NotImplementedError


class GoogleCalendarAdapter(CalendarAdapter):
    provider = "google"

    def create_event(self, payload: Dict) -> str:
        return "google-event-id"

    def update_event(self, external_id: str, payload: Dict) -> None:
        return None

    def delete_event(self, external_id: str) -> None:
        return None


class MicrosoftGraphAdapter(CalendarAdapter):
    provider = "microsoft"

    def create_event(self, payload: Dict) -> str:
        return "ms-event-id"

    def update_event(self, external_id: str, payload: Dict) -> None:
        return None

    def delete_event(self, external_id: str) -> None:
        return None
