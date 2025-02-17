import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles

from core.config import settings
from routes import programs, pk, hydro, bassin, scenarios, data, sld, stationsnap, amont_aval, pk_geom, fulldata, data_donuts, profile_en_long, varcompartment
from core.logger import logger
from scheduler.scheduler import lifespan


app = FastAPI(
    root_path="/api",
    lifespan=lifespan,
)
lifespan(app)


# Middlewares
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"], expose_headers=["Content-Type"])
app.add_middleware(GZipMiddleware, minimum_size=1000, compresslevel=9)

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
app.include_router(varcompartment.router)

# Front
app.mount("/", StaticFiles(directory="./static", html=True), name="static")

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    """
    Redirige toutes les routes inconnues vers index.html (SPA handling).
    """
    index_path = "./static/index.html"
    if os.path.exists(index_path):
        return FileResponse(index_path)
    else:
        return RedirectResponse(url="/static/index.html")