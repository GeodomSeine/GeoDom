from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy import MetaData, Table, create_engine
from core.config import settings

# moteurs BDD
sync_engine_pynuts = create_engine(settings.DATABASE_PYNUTS_URL.replace("postgresql+asyncpg", "postgresql"))
async_engine_pynuts = create_async_engine(settings.DATABASE_PYNUTS_URL, echo=True)
async_engine_donuts = create_async_engine(settings.DATABASE_DONUTS_URL, echo=True)

# sessions BDD
async_session_pynuts = sessionmaker(async_engine_pynuts, expire_on_commit=False, class_=AsyncSession)
async_session_donuts = sessionmaker(async_engine_donuts, expire_on_commit=False, class_=AsyncSession)
sync_session_pynuts = sessionmaker(sync_engine_pynuts, expire_on_commit=False, class_=Session)


def load_output_table_sync(program: str) -> Table:
    metadata = MetaData()
    with sync_engine_pynuts.connect() as conn:
        table = Table(
            "output_edl_240912", metadata, autoload_with=conn, schema=program
        )
        return table