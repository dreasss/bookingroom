from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import admin, bookings, rooms, users
from app.core.config import settings

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"] ,
)

app.include_router(users.router)
app.include_router(rooms.router)
app.include_router(bookings.router)
app.include_router(admin.router)


@app.get("/health")
def health():
    return {"status": "ok"}
