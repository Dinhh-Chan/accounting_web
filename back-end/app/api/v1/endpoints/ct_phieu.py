from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, Query, Path, Body, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dependencies.user import get_current_active_user
from app.services.ct_phieu import ct_phieu
from app.models.user import User
from app.dto.ct_phieu import CTPhieu, CTPhieuCreate, CTPhieuUpdate

router = APIRouter()


@router.get("/voucher/{so_phieu}", response_model=List[CTPhieu])
async def read_ctphieu_by_voucher(
    so_phieu: str = Path(..., description="Số phiếu"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy tất cả chi tiết của một phiếu giảm giá.
    """
    items = await ct_phieu.get_by_so_phieu(db, so_phieu=so_phieu)
    return items


@router.get("/{so_phieu}/{ma_spdv}", response_model=CTPhieu)
async def read_ctphieu(
    so_phieu: str = Path(..., description="Số phiếu"),
    ma_spdv: str = Path(..., description="Mã sản phẩm dịch vụ"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy chi tiết của một phiếu giảm giá theo mã sản phẩm.
    """
    item = await ct_phieu.get_by_so_phieu_and_ma_spdv(db, so_phieu=so_phieu, ma_spdv=ma_spdv)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy chi tiết phiếu giảm giá"
        )
    return item


@router.post("", response_model=CTPhieu, status_code=status.HTTP_201_CREATED)
async def create_ctphieu(
    *,
    db: AsyncSession = Depends(get_db),
    item_in: CTPhieuCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Tạo chi tiết phiếu giảm giá mới.
    """
    # Kiểm tra xem đã tồn tại chi tiết cho phiếu và sản phẩm này chưa
    existing = await ct_phieu.get_by_so_phieu_and_ma_spdv(
        db, so_phieu=item_in.sophieu, ma_spdv=item_in.maspdv
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Đã tồn tại chi tiết phiếu giảm giá cho sản phẩm này"
        )
    
    return await ct_phieu.create(db=db, obj_in=item_in)


@router.put("/{so_phieu}/{ma_spdv}", response_model=CTPhieu)
async def update_ctphieu(
    *,
    so_phieu: str = Path(..., description="Số phiếu"),
    ma_spdv: str = Path(..., description="Mã sản phẩm dịch vụ"),
    item_in: CTPhieuUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Cập nhật chi tiết phiếu giảm giá.
    """
    item = await ct_phieu.get_by_so_phieu_and_ma_spdv(db, so_phieu=so_phieu, ma_spdv=ma_spdv)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy chi tiết phiếu giảm giá"
        )
    
    updated_item = await ct_phieu.update_by_so_phieu_and_ma_spdv(
        db, so_phieu=so_phieu, ma_spdv=ma_spdv, obj_in=item_in
    )
    return updated_item


@router.delete("/{so_phieu}/{ma_spdv}", response_model=CTPhieu)
async def delete_ctphieu(
    *,
    so_phieu: str = Path(..., description="Số phiếu"),
    ma_spdv: str = Path(..., description="Mã sản phẩm dịch vụ"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Xóa chi tiết phiếu giảm giá.
    """
    item = await ct_phieu.get_by_so_phieu_and_ma_spdv(db, so_phieu=so_phieu, ma_spdv=ma_spdv)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy chi tiết phiếu giảm giá"
        )
    
    # Composite primary key - cần xử lý đặc biệt
    db_obj = await db.get(CTPhieu, {"sophieu": so_phieu, "maspdv": ma_spdv})
    if db_obj:
        await db.delete(db_obj)
        await db.commit()
    
    return item


@router.delete("/voucher/{so_phieu}", response_model=Dict)
async def delete_ctphieu_by_voucher(
    *,
    so_phieu: str = Path(..., description="Số phiếu"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Xóa tất cả chi tiết của một phiếu giảm giá.
    """
    count = await ct_phieu.delete_by_so_phieu(db, so_phieu=so_phieu)
    return {"message": f"Đã xóa {count} chi tiết phiếu giảm giá", "count": count}


@router.get("/statistics/frequency", response_model=List[Dict])
async def get_product_discount_frequency(
    limit: int = Query(10, description="Số lượng sản phẩm trả về"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy danh sách sản phẩm được giảm giá nhiều nhất.
    """
    return await ct_phieu.get_product_discount_frequency(db, limit=limit)


@router.get("/statistics/amount", response_model=List[Dict])
async def get_product_discount_amount(
    limit: int = Query(10, description="Số lượng sản phẩm trả về"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy danh sách sản phẩm có giá trị giảm giá cao nhất.
    """
    return await ct_phieu.get_product_discount_amount(db, limit=limit)