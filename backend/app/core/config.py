from pydantic import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Booking Room"
    environment: str = "dev"
    database_url: str = "postgresql+psycopg://booking:booking@db:5432/booking"
    redis_url: str = "redis://redis:6379/0"
    jwt_secret: str = "change-me"
    jwt_issuer: str = "bookingroom"
    jwt_audience: str = "bookingroom"
    jwt_exp_minutes: int = 15
    refresh_exp_days: int = 30
    allowed_domains: str = "corp.example"

    oidc_google_client_id: str = ""
    oidc_google_client_secret: str = ""
    oidc_google_discovery_url: str = "https://accounts.google.com/.well-known/openid-configuration"

    oidc_microsoft_client_id: str = ""
    oidc_microsoft_client_secret: str = ""
    oidc_microsoft_discovery_url: str = "https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration"

    oidc_okta_client_id: str = ""
    oidc_okta_client_secret: str = ""
    oidc_okta_discovery_url: str = ""

    oidc_jinr_client_id: str = ""
    oidc_jinr_client_secret: str = ""
    oidc_jinr_discovery_url: str = "https://login.jinr.ru/.well-known/openid-configuration"

    class Config:
        env_file = ".env"


settings = Settings()
