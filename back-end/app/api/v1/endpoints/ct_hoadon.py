from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, Query, Path, Body, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dependencies.user import get_current_active_user
from app.services.ct_hoadon import ct_hoadon
from app.models.user import User
from app.dto.ct_hoadon import CTHoaDon, CTHoaDonCreate, CTHoaDonUpdate

router = APIRouter()


@router.get("/invoice/{so_ct}", response_model=List[CTHoaDon])
async def read_cthoadon_by_invoice(
    so_ct: str = Path(..., description="Số chứng từ"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy tất cả chi tiết của một hóa đơn.
    """
    items = await ct_hoadon.get_by_so_ct(db, so_ct=so_ct)
    return items


@router.get("/{so_ct}/{ma_spdv}", response_model=CTHoaDon)
async def read_cthoadon(
    so_ct: str = Path(..., description="Số chứng từ"),
    ma_spdv: str = Path(..., description="Mã sản phẩm dịch vụ"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy chi tiết của một hóa đơn theo mã sản phẩm.
    """
    item = await ct_hoadon.get_by_so_ct_and_ma_spdv(db, so_ct=so_ct, ma_spdv=ma_spdv)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy chi tiết hóa đơn"
        )
    return item


@router.post("", response_model=CTHoaDon, status_code=status.HTTP_201_CREATED)
async def create_cthoadon(
    *,
    db: AsyncSession = Depends(get_db),
    item_in: CTHoaDonCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Tạo chi tiết hóa đơn mới.
    """
    # Kiểm tra xem đã tồn tại chi tiết cho hóa đơn và sản phẩm này chưa
    existing = await ct_hoadon.get_by_so_ct_and_ma_spdv(
        db, so_ct=item_in.soct, ma_spdv=item_in.maspdv
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Đã tồn tại chi tiết hóa đơn cho sản phẩm này"
        )
    
    return await ct_hoadon.create(db=db, obj_in=item_in)


@router.put("/{so_ct}/{ma_spdv}", response_model=CTHoaDon)
async def update_cthoadon(
    *,
    so_ct: str = Path(..., description="Số chứng từ"),
    ma_spdv: str = Path(..., description="Mã sản phẩm dịch vụ"),
    item_in: CTHoaDonUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Cập nhật chi tiết hóa đơn.
    """
    item = await ct_hoadon.get_by_so_ct_and_ma_spdv(db, so_ct=so_ct, ma_spdv=ma_spdv)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy chi tiết hóa đơn"
        )
    
    updated_item = await ct_hoadon.update_by_so_ct_and_ma_spdv(
        db, so_ct=so_ct, ma_spdv=ma_spdv, obj_in=item_in
    )
    return updated_item


@router.delete("/{so_ct}/{ma_spdv}", response_model=CTHoaDon)
async def delete_cthoadon(
    *,
    so_ct: str = Path(..., description="Số chứng từ"),
    ma_spdv: str = Path(..., description="Mã sản phẩm dịch vụ"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Xóa chi tiết hóa đơn.
    """
    item = await ct_hoadon.get_by_so_ct_and_ma_spdv(db, so_ct=so_ct, ma_spdv=ma_spdv)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy chi tiết hóa đơn"
        )
    
    # Composite primary key - cần xử lý đặc biệt
    db_obj = await db.get(CTHoaDon, {"soct": so_ct, "maspdv": ma_spdv})
    if db_obj:
        await db.delete(db_obj)
        await db.commit()
    
    return item


@router.delete("/invoice/{so_ct}", response_model=Dict)
async def delete_cthoadon_by_invoice(
    *,
    so_ct: str = Path(..., description="Số chứng từ"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Xóa tất cả chi tiết của một hóa đơn.
    """
    count = await ct_hoadon.delete_by_so_ct(db, so_ct=so_ct)
    return {"message": f"Đã xóa {count} chi tiết hóa đơn", "count": count}


@router.get("/statistics/frequency", response_model=List[Dict])
async def get_product_sales_frequency(
    limit: int = Query(10, description="Số lượng sản phẩm trả về"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy danh sách sản phẩm bán thường xuyên nhất.
    """
    return await ct_hoadon.get_product_sales_frequency(db, limit=limit)


@router.get("/statistics/revenue", response_model=List[Dict])
async def get_product_sales_revenue(
    limit: int = Query(10, description="Số lượng sản phẩm trả về"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy danh sách sản phẩm có doanh thu cao nhất.
    """
    return await ct_hoadon.get_product_sales_revenue(db, limit=limit)