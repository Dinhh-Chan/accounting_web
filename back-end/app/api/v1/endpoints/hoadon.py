from typing import Any, Dict, List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dependencies.user import get_current_active_user
from app.services.hoadon import hoadon
from app.models.user import User
from app.dto.hoadon import HoaDon, HoaDonCreate, HoaDonUpdate, HoaDonWithDetails

router = APIRouter()


@router.post("/", response_model=HoaDon, status_code=201)
async def create_hoadon(
    *,
    db: AsyncSession = Depends(get_db),
    hoadon_in: HoaDonCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Tạo hóa đơn mới.
    """
    return await hoadon.create_with_details(db=db, obj_in=hoadon_in)


@router.get("/", response_model=List[HoaDon])
async def read_hoadons(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy danh sách hóa đơn.
    """
    return await hoadon.get_multi(db, skip=skip, limit=limit)


@router.get("/by-date-range", response_model=List[HoaDon])
async def read_hoadons_by_date_range(
    start_date: date,
    end_date: date,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy danh sách hóa đơn theo khoảng thời gian.
    """
    return await hoadon.get_by_date_range(db, start_date=start_date, end_date=end_date)


@router.get("/by-customer/{ma_kh}", response_model=List[HoaDon])
async def read_hoadons_by_customer(
    ma_kh: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy danh sách hóa đơn của một khách hàng.
    """
    return await hoadon.get_by_ma_kh(db, ma_kh=ma_kh)


@router.get("/revenue-by-customer", response_model=List[Dict])
async def get_revenue_by_customer(
    start_date: date,
    end_date: date,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy thống kê doanh thu theo từng khách hàng.
    """
    return await hoadon.get_revenue_by_customer(db, start_date=start_date, end_date=end_date)


@router.get("/revenue-by-product", response_model=List[Dict])
async def get_revenue_by_product(
    start_date: date,
    end_date: date,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy thống kê doanh thu theo từng sản phẩm.
    """
    return await hoadon.get_revenue_by_product(db, start_date=start_date, end_date=end_date)


@router.get("/revenue-by-month/{year}", response_model=List[Dict])
async def get_revenue_by_month(
    year: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy thống kê doanh thu theo từng tháng trong năm.
    """
    return await hoadon.get_revenue_by_month(db, year=year)


@router.get("/total-revenue", response_model=Dict)
async def get_total_revenue(
    start_date: date,
    end_date: date,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy tổng doanh thu trong khoảng thời gian.
    """
    return await hoadon.get_total_revenue(db, start_date=start_date, end_date=end_date)


@router.get("/{so_ct}", response_model=HoaDonWithDetails)
async def read_hoadon(
    so_ct: str = Path(..., description="Số hóa đơn"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy thông tin chi tiết của một hóa đơn.
    """
    result = await hoadon.get_with_details(db=db, so_ct=so_ct)
    if not result:
        raise HTTPException(status_code=404, detail="Không tìm thấy hóa đơn")
    return result