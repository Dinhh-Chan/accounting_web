from typing import Any, Dict, List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Path, Body, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dependencies.user import get_current_active_user
from app.services.dinhmucck import dinhmucck
from app.models.user import User
from app.dto.dinhmucck import DinhMucCK, DinhMucCKCreate, DinhMucCKUpdate

router = APIRouter()


@router.post("", response_model=DinhMucCK, status_code=status.HTTP_201_CREATED)
async def create_dinhmucck(
    *,
    db: AsyncSession = Depends(get_db),
    dinhmucck_in: DinhMucCKCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Tạo định mức chiết khấu mới cho sản phẩm.
    """
    # Kiểm tra xem đã tồn tại định mức cho sản phẩm và ngày hiệu lực chưa
    existing = await dinhmucck.get_by_ma_spdv_and_date(
        db, ma_spdv=dinhmucck_in.maspdv, ngay_hl=dinhmucck_in.ngayhl
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Đã tồn tại định mức chiết khấu cho sản phẩm này trong ngày hiệu lực này"
        )
    
    return await dinhmucck.create(db=db, obj_in=dinhmucck_in)


@router.get("", response_model=List[DinhMucCK])
async def read_dinhmucck(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy danh sách định mức chiết khấu.
    """
    return await dinhmucck.get_multi(db, skip=skip, limit=limit)


@router.get("/product/{ma_spdv}", response_model=List[DinhMucCK])
async def read_dinhmucck_by_product(
    ma_spdv: str = Path(..., description="Mã sản phẩm dịch vụ"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy lịch sử định mức chiết khấu của một sản phẩm.
    """
    return await dinhmucck.get_by_ma_spdv(db, ma_spdv=ma_spdv)


@router.get("/latest/{ma_spdv}", response_model=DinhMucCK)
async def read_latest_discount(
    ma_spdv: str = Path(..., description="Mã sản phẩm dịch vụ"),
    date: Optional[datetime] = Query(None, description="Ngày tham chiếu (mặc định: ngày hiện tại)"),
    amount: Optional[float] = Query(None, description="Số tiền mua hàng để kiểm tra mức chiết khấu"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy định mức chiết khấu áp dụng cho một sản phẩm dựa trên ngày và số tiền mua.
    """
    discount = await dinhmucck.get_latest_discount(db, ma_spdv=ma_spdv, date=date, amount=amount)
    if not discount:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy định mức chiết khấu cho sản phẩm này"
        )
    return discount


@router.get("/{ma_spdv}/{ngay_hl}", response_model=DinhMucCK)
async def read_dinhmucck_by_product_and_date(
    ma_spdv: str = Path(..., description="Mã sản phẩm dịch vụ"),
    ngay_hl: datetime = Path(..., description="Ngày hiệu lực"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy định mức chiết khấu của sản phẩm theo ngày hiệu lực cụ thể.
    """
    discount = await dinhmucck.get_by_ma_spdv_and_date(db, ma_spdv=ma_spdv, ngay_hl=ngay_hl)
    if not discount:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy định mức chiết khấu cho sản phẩm này trong ngày hiệu lực này"
        )
    return discount


@router.put("/{ma_spdv}/{ngay_hl}", response_model=DinhMucCK)
async def update_dinhmucck(
    *,
    ma_spdv: str = Path(..., description="Mã sản phẩm dịch vụ"),
    ngay_hl: datetime = Path(..., description="Ngày hiệu lực"),
    dinhmucck_in: DinhMucCKUpdate = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Cập nhật thông tin định mức chiết khấu.
    """
    discount = await dinhmucck.get_by_ma_spdv_and_date(db, ma_spdv=ma_spdv, ngay_hl=ngay_hl)
    if not discount:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy định mức chiết khấu cho sản phẩm này trong ngày hiệu lực này"
        )
    
    # Nếu thay đổi maspdv hoặc ngayhl, kiểm tra xem đã tồn tại chưa
    if (dinhmucck_in.maspdv and dinhmucck_in.maspdv != discount.maspdv) or \
       (dinhmucck_in.ngayhl and dinhmucck_in.ngayhl != discount.ngayhl):
        existing = await dinhmucck.get_by_ma_spdv_and_date(
            db, 
            ma_spdv=dinhmucck_in.maspdv if dinhmucck_in.maspdv else discount.maspdv,
            ngay_hl=dinhmucck_in.ngayhl if dinhmucck_in.ngayhl else discount.ngayhl
        )
        if existing and existing != discount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Đã tồn tại định mức chiết khấu cho sản phẩm này trong ngày hiệu lực này"
            )
    
    return await dinhmucck.update(db=db, db_obj=discount, obj_in=dinhmucck_in)


@router.delete("/{ma_spdv}/{ngay_hl}", response_model=DinhMucCK)
async def delete_dinhmucck(
    *,
    ma_spdv: str = Path(..., description="Mã sản phẩm dịch vụ"),
    ngay_hl: datetime = Path(..., description="Ngày hiệu lực"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Xóa thông tin định mức chiết khấu.
    """
    discount = await dinhmucck.get_by_ma_spdv_and_date(db, ma_spdv=ma_spdv, ngay_hl=ngay_hl)
    if not discount:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy định mức chiết khấu cho sản phẩm này trong ngày hiệu lực này"
        )
    
    # Composite primary key - cần xử lý đặc biệt
    db_obj = await db.get(DinhMucCK, {"maspdv": ma_spdv, "ngayhl": ngay_hl})
    if db_obj:
        await db.delete(db_obj)
        await db.commit()
    
    return discount