"""PostgreSQL database connection using asyncpg."""

import asyncpg
from app.config import DATABASE_URL

_pool: asyncpg.Pool | None = None


async def get_pool() -> asyncpg.Pool:
    """Get or create the connection pool."""
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(DATABASE_URL, min_size=2, max_size=10)
    return _pool


async def execute_query(query: str) -> list[dict]:
    """Execute a SELECT query and return results as list of dicts."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(query)
        return [dict(row) for row in rows]


async def execute_ddl(sql: str) -> None:
    """Execute DDL statements (CREATE TABLE, etc.)."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(sql)


async def close_pool() -> None:
    """Close the connection pool."""
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None
