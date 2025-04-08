from typing import Any, Dict, List
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dependencies.user import get_current_active_user
from app.services.phieugiamgia import phieugiamgia
from app.models.user import User
from app.dto.phieugiamgia import PhieuGiamGia, PhieuGiamGiaCreate, PhieuGiamGiaUpdate, PhieuGiamGiaWithDetails

router = APIRouter()


@router.post("", response_model=PhieuGiamGia, status_code=status.HTTP_201_CREATED)
async def create_phieugiamgia(
    *,
    db: AsyncSession = Depends(get_db),
    phieugiamgia_in: PhieuGiamGiaCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Tạo phiếu giảm giá mới.
    """
    return await phieugiamgia.create_with_details(db=db, obj_in=phieugiamgia_in)


@router.get("", response_model=List[PhieuGiamGia])
async def read_phieugiamgias(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy danh sách phiếu giảm giá.
    """
    return await phieugiamgia.get_multi(db, skip=skip, limit=limit)


@router.get("/by-date-range", response_model=List[PhieuGiamGia])
async def read_phieugiamgias_by_date_range(
    start_date: date,
    end_date: date,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy danh sách phiếu giảm giá theo khoảng thời gian.
    """
    return await phieugiamgia.get_by_date_range(db, start_date=start_date, end_date=end_date)


@router.get("/by-customer/{ma_kh}", response_model=List[PhieuGiamGia])
async def read_phieugiamgias_by_customer(
    ma_kh: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy danh sách phiếu giảm giá của một khách hàng.
    """
    return await phieugiamgia.get_by_ma_kh(db, ma_kh=ma_kh)


@router.get("/by-invoice/{so_ct}", response_model=List[PhieuGiamGia])
async def read_phieugiamgias_by_invoice(
    so_ct: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy danh sách phiếu giảm giá của một hóa đơn.
    """
    return await phieugiamgia.get_by_so_ct(db, so_ct=so_ct)


@router.get("/statistics/by-customer", response_model=List[Dict])
async def get_discount_by_customer(
    start_date: date,
    end_date: date,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy thống kê giảm giá theo từng khách hàng.
    """
    return await phieugiamgia.get_discount_by_customer(db, start_date=start_date, end_date=end_date)


@router.get("/statistics/by-product", response_model=List[Dict])
async def get_discount_by_product(
    start_date: date,
    end_date: date,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy thống kê giảm giá theo từng sản phẩm.
    """
    return await phieugiamgia.get_discount_by_product(db, start_date=start_date, end_date=end_date)


@router.get("/statistics/total", response_model=Dict)
async def get_total_discount(
    start_date: date,
    end_date: date,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy tổng giảm giá trong khoảng thời gian.
    """
    return await phieugiamgia.get_total_discount(db, start_date=start_date, end_date=end_date)


@router.get("/next-id", response_model=Dict[str, str])
async def get_next_so_phieu(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy số phiếu giảm giá tiếp theo.
    """
    next_id = await phieugiamgia.get_next_so_phieu(db)
    return {"sophieu": next_id}


@router.get("/{so_phieu}", response_model=PhieuGiamGiaWithDetails)
async def read_phieugiamgia(
    so_phieu: str = Path(..., description="Số phiếu giảm giá"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy thông tin chi tiết của một phiếu giảm giá.
    """
    result = await phieugiamgia.get_with_details(db=db, so_phieu=so_phieu)
    if not result:
        raise HTTPException(status_code=404, detail="Không tìm thấy phiếu giảm giá")
    return result


@router.put("/{so_phieu}", response_model=PhieuGiamGia)
async def update_phieugiamgia(
    *,
    so_phieu: str = Path(..., description="Số phiếu giảm giá"),
    phieugiamgia_in: PhieuGiamGiaUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Cập nhật thông tin phiếu giảm giá.
    """
    phieu = await phieugiamgia.get_by_so_phieu(db, so_phieu=so_phieu)
    if not phieu:
        raise HTTPException(status_code=404, detail="Không tìm thấy phiếu giảm giá")
    
    return await phieugiamgia.update(db=db, db_obj=phieu, obj_in=phieugiamgia_in)


@router.delete("/{so_phieu}", response_model=PhieuGiamGia)
async def delete_phieugiamgia(
    *,
    so_phieu: str = Path(..., description="Số phiếu giảm giá"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Xóa phiếu giảm giá.
    """
    phieu = await phieugiamgia.get_by_so_phieu(db, so_phieu=so_phieu)
    if not phieu:
        raise HTTPException(status_code=404, detail="Không tìm thấy phiếu giảm giá")
    
    return await phieugiamgia.remove(db=db, id=so_phieu)