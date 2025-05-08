from fastapi import FastAPI
import uvicorn
from config.database import create_db_and_tables

from routers.users import router_users
from routers.auth import router_auth
from routers.profiles import router_profiles
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

create_db_and_tables()

app.include_router(router_auth)
app.include_router(router_users)
app.include_router(router_profiles)


@app.get("/")
async def root():
    return {"message": "API de Nutrición y Salud está en línea"}


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


if __name__ == "__main__":
    uvicorn.run("main:app", reload=True)