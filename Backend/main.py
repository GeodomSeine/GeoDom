from http.client import HTTPException
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from core.user_database import init_db

from core.config import settings
from routes import programs, pk, hydro, bassin, scenarios, data, sld, stationsnap, amont_aval, pk_geom, fulldata, data_donuts, profile_en_long, varcompartment, admin
from core.logger import logger
from core.auth import auth_router
from scheduler.scheduler import lifespan
from starlette.exceptions import HTTPException as StarletteHTTPException
import uvicorn


app = FastAPI(
    root_path="/api",
    lifespan=lifespan,
)
lifespan(app)


# Middlewares
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"], expose_headers=["Content-Type"])
app.add_middleware(GZipMiddleware, minimum_size=1000, compresslevel=9)

init_db()

# Routes
app.include_router(programs.router)
app.include_router(pk.router)
app.include_router(hydro.router)
app.include_router(bassin.router)
app.include_router(stationsnap.router)
app.include_router(scenarios.router)
app.include_router(data.router)
app.include_router(sld.router)
app.include_router(amont_aval.router)
app.include_router(pk_geom.router)
app.include_router(fulldata.router)
app.include_router(data_donuts.router)
app.include_router(profile_en_long.router)
app.include_router(admin.router, prefix="") 
app.include_router(auth_router, prefix="/auth")

# Front
class SPAStaticFiles(StaticFiles):
    async def get_response(self, path: str, scope):
        try:
            return await super().get_response(path, scope)
        except (HTTPException, StarletteHTTPException) as ex:
            if ex.status_code == 404:
                return await super().get_response("index.html", scope)
            else:
                raise ex

app.mount("/", SPAStaticFiles(directory="./static", html=True), name="spa-static-files")


if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8080)