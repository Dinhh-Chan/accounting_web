# alembic/env.py
import asyncio
import os
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# this is the Alembic Config object
config = context.config

# Interpret the config file for Python logging
fileConfig(config.config_file_name)

# Thêm models vào context
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.db.base_class import Base
# Import tất cả các models để Alembic có thể phát hiện
from app.models.user import User
from app.models.khachhang import KhachHang
from app.models.spdv import SPDV
from app.models.tkkt import TKKT
from app.models.banggia import BangGia
from app.models.dinhmucck import DinhMucCK
from app.models.hoadon import HoaDon
from app.models.ct_hoadon import CTHoaDon
from app.models.phieugiamgia import PhieuGiamGia
from app.models.ct_phieu import CTPhieu

target_metadata = Base.metadata

# Đọc URL từ biến môi trường nếu có
db_url = os.environ.get('SQL_DATABASE_URL')
if db_url:
    config.set_main_option('sqlalchemy.url', db_url)

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()

async def run_migrations_online() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()

if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())