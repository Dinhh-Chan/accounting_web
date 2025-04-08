from typing import Any, List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Path, Body, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dependencies.user import get_current_active_user
from app.services.banggia import banggia
from app.models.user import User
from app.dto.banggia import BangGia, BangGiaCreate, BangGiaUpdate

router = APIRouter()


@router.post("", response_model=BangGia, status_code=status.HTTP_201_CREATED)
async def create_banggia(
    *,
    db: AsyncSession = Depends(get_db),
    banggia_in: BangGiaCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Tạo giá mới cho sản phẩm.
    """
    # Kiểm tra xem đã tồn tại giá cho sản phẩm và ngày hiệu lực chưa
    existing = await banggia.get_by_ma_spdv_and_date(
        db, ma_spdv=banggia_in.maspdv, ngay_hl=banggia_in.ngayhl
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Đã tồn tại giá cho sản phẩm này trong ngày hiệu lực này"
        )
    
    return await banggia.create(db=db, obj_in=banggia_in)


@router.get("", response_model=List[BangGia])
async def read_banggia(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy danh sách bảng giá.
    """
    return await banggia.get_multi(db, skip=skip, limit=limit)


@router.get("/product/{ma_spdv}", response_model=List[BangGia])
async def read_banggia_by_product(
    ma_spdv: str = Path(..., description="Mã sản phẩm dịch vụ"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy lịch sử giá của một sản phẩm.
    """
    return await banggia.get_by_ma_spdv(db, ma_spdv=ma_spdv)


@router.get("/latest/{ma_spdv}", response_model=BangGia)
async def read_latest_price(
    ma_spdv: str = Path(..., description="Mã sản phẩm dịch vụ"),
    date: Optional[datetime] = Query(None, description="Ngày tham chiếu (mặc định: ngày hiện tại)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy giá mới nhất của sản phẩm, có hiệu lực vào hoặc trước ngày tham chiếu.
    """
    price = await banggia.get_latest_price(db, ma_spdv=ma_spdv, date=date)
    if not price:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy giá cho sản phẩm này"
        )
    return price


@router.get("/{ma_spdv}/{ngay_hl}", response_model=BangGia)
async def read_banggia_by_product_and_date(
    ma_spdv: str = Path(..., description="Mã sản phẩm dịch vụ"),
    ngay_hl: datetime = Path(..., description="Ngày hiệu lực"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy giá của sản phẩm theo ngày hiệu lực cụ thể.
    """
    price = await banggia.get_by_ma_spdv_and_date(db, ma_spdv=ma_spdv, ngay_hl=ngay_hl)
    if not price:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy giá cho sản phẩm này trong ngày hiệu lực này"
        )
    return price


@router.put("/{ma_spdv}/{ngay_hl}", response_model=BangGia)
async def update_banggia(
    *,
    ma_spdv: str = Path(..., description="Mã sản phẩm dịch vụ"),
    ngay_hl: datetime = Path(..., description="Ngày hiệu lực"),
    banggia_in: BangGiaUpdate = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Cập nhật thông tin giá.
    """
    price = await banggia.get_by_ma_spdv_and_date(db, ma_spdv=ma_spdv, ngay_hl=ngay_hl)
    if not price:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy giá cho sản phẩm này trong ngày hiệu lực này"
        )
    
    # Nếu thay đổi maspdv hoặc ngayhl, kiểm tra xem đã tồn tại chưa
    if (banggia_in.maspdv and banggia_in.maspdv != price.maspdv) or \
       (banggia_in.ngayhl and banggia_in.ngayhl != price.ngayhl):
        existing = await banggia.get_by_ma_spdv_and_date(
            db, 
            ma_spdv=banggia_in.maspdv if banggia_in.maspdv else price.maspdv,
            ngay_hl=banggia_in.ngayhl if banggia_in.ngayhl else price.ngayhl
        )
        if existing and existing != price:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Đã tồn tại giá cho sản phẩm này trong ngày hiệu lực này"
            )
    
    return await banggia.update(db=db, db_obj=price, obj_in=banggia_in)


@router.delete("/{ma_spdv}/{ngay_hl}", response_model=BangGia)
async def delete_banggia(
    *,
    ma_spdv: str = Path(..., description="Mã sản phẩm dịch vụ"),
    ngay_hl: datetime = Path(..., description="Ngày hiệu lực"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Xóa thông tin giá.
    """
    price = await banggia.get_by_ma_spdv_and_date(db, ma_spdv=ma_spdv, ngay_hl=ngay_hl)
    if not price:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy giá cho sản phẩm này trong ngày hiệu lực này"
        )
    
    # Composite primary key - cần xử lý đặc biệt
    db_obj = await db.get(BangGia, {"maspdv": ma_spdv, "ngayhl": ngay_hl})
    if db_obj:
        await db.delete(db_obj)
        await db.commit()
    
    return price