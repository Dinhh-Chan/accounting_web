from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dependencies.user import get_current_active_user
from app.services.khachhang import khachhang
from app.models.user import User
from app.dto.khachhang import KhachHang, KhachHangCreate, KhachHangUpdate

router = APIRouter()


@router.get("", response_model=List[KhachHang])
async def get_khachhangs(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0, description="Số lượng bản ghi bỏ qua"),
    limit: int = Query(100, ge=1, le=1000, description="Số lượng bản ghi tối đa"),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy danh sách khách hàng.
    """
    khachhangs = await khachhang.get_multi(db, skip=skip, limit=limit)
    return khachhangs


@router.post("", response_model=KhachHang, status_code=status.HTTP_201_CREATED)
async def create_khachhang(
    *,
    db: AsyncSession = Depends(get_db),
    khachhang_in: KhachHangCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Tạo khách hàng mới.
    """
    # Kiểm tra nếu masothue đã tồn tại
    if khachhang_in.masothue:
        exists = await khachhang.exists_ma_so_thue(db, ma_so_thue=khachhang_in.masothue)
        if exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mã số thuế đã tồn tại"
            )
    
    # Tạo khách hàng với ID tự động
    khachhang_obj = await khachhang.create_with_id(db, obj_in=khachhang_in)
    return khachhang_obj


@router.get("/search", response_model=List[KhachHang])
async def search_khachhangs(
    *,
    db: AsyncSession = Depends(get_db),
    keyword: str = Query(..., description="Từ khóa tìm kiếm (tên, địa chỉ, mã số thuế)"),
    skip: int = Query(0, ge=0, description="Số lượng bản ghi bỏ qua"),
    limit: int = Query(100, ge=1, le=1000, description="Số lượng bản ghi tối đa"),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Tìm kiếm khách hàng theo tên, địa chỉ hoặc mã số thuế.
    """
    khachhangs = await khachhang.search_khachhang(
        db, keyword=keyword, skip=skip, limit=limit
    )
    return khachhangs


@router.get("/{ma_kh}", response_model=KhachHang)
async def get_khachhang(
    *,
    db: AsyncSession = Depends(get_db),
    ma_kh: str = Path(..., description="Mã khách hàng"),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy thông tin khách hàng theo mã.
    """
    khachhang_obj = await khachhang.get_by_ma_kh(db, ma_kh=ma_kh)
    if not khachhang_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy khách hàng"
        )
    return khachhang_obj


@router.get("/masothue/{ma_so_thue}", response_model=KhachHang)
async def get_khachhang_by_masothue(
    *,
    db: AsyncSession = Depends(get_db),
    ma_so_thue: str = Path(..., description="Mã số thuế khách hàng"),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy thông tin khách hàng theo mã số thuế.
    """
    khachhang_obj = await khachhang.get_by_ma_so_thue(db, ma_so_thue=ma_so_thue)
    if not khachhang_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy khách hàng với mã số thuế này"
        )
    return khachhang_obj


@router.put("/{ma_kh}", response_model=KhachHang)
async def update_khachhang(
    *,
    db: AsyncSession = Depends(get_db),
    ma_kh: str = Path(..., description="Mã khách hàng"),
    khachhang_in: KhachHangUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Cập nhật thông tin khách hàng.
    """
    khachhang_obj = await khachhang.get_by_ma_kh(db, ma_kh=ma_kh)
    if not khachhang_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy khách hàng"
        )
    
    # Kiểm tra nếu masothue đã thay đổi và đã tồn tại
    if khachhang_in.masothue and khachhang_in.masothue != khachhang_obj.masothue:
        exists = await khachhang.exists_ma_so_thue(db, ma_so_thue=khachhang_in.masothue)
        if exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mã số thuế đã tồn tại"
            )
    
    khachhang_obj = await khachhang.update(db, db_obj=khachhang_obj, obj_in=khachhang_in)
    return khachhang_obj


@router.delete("/{ma_kh}", response_model=KhachHang)
async def delete_khachhang(
    *,
    db: AsyncSession = Depends(get_db),
    ma_kh: str = Path(..., description="Mã khách hàng"),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Xóa khách hàng.
    """
    khachhang_obj = await khachhang.get_by_ma_kh(db, ma_kh=ma_kh)
    if not khachhang_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy khách hàng"
        )
    
    khachhang_obj = await khachhang.remove(db, id=ma_kh)
    return khachhang_obj


@router.get("/check/ma-kh/{ma_kh}", response_model=dict)
async def check_ma_kh_exists(
    *,
    db: AsyncSession = Depends(get_db),
    ma_kh: str = Path(..., description="Mã khách hàng"),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Kiểm tra mã khách hàng đã tồn tại chưa.
    """
    exists = await khachhang.exists_ma_kh(db, ma_kh=ma_kh)
    return {"exists": exists}


@router.get("/check/ma-so-thue/{ma_so_thue}", response_model=dict)
async def check_ma_so_thue_exists(
    *,
    db: AsyncSession = Depends(get_db),
    ma_so_thue: str = Path(..., description="Mã số thuế"),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Kiểm tra mã số thuế đã tồn tại chưa.
    """
    exists = await khachhang.exists_ma_so_thue(db, ma_so_thue=ma_so_thue)
    return {"exists": exists}


@router.get("/next/ma-kh", response_model=dict)
async def get_next_ma_kh(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy mã khách hàng tiếp theo.
    """
    next_ma_kh = await khachhang.get_next_ma_kh(db)
    return {"ma_kh": next_ma_kh}