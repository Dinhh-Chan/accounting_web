from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dependencies.user import get_current_active_user
from app.services.spdv import spdv
from app.models.user import User
from app.dto.spdv import SPDV, SPDVCreate, SPDVUpdate

router = APIRouter()


@router.post("", response_model=SPDV, status_code=status.HTTP_201_CREATED)
async def create_spdv(
    *,
    db: AsyncSession = Depends(get_db),
    spdv_in: SPDVCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Tạo sản phẩm dịch vụ mới.
    """
    # Tạo sản phẩm với ID tự động
    return await spdv.create_with_id(db=db, obj_in=spdv_in)


@router.get("", response_model=List[SPDV])
async def read_spdvs(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0, description="Số lượng bản ghi bỏ qua"),
    limit: int = Query(100, ge=1, le=1000, description="Số lượng bản ghi tối đa"),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy danh sách sản phẩm dịch vụ.
    """
    return await spdv.get_multi(db, skip=skip, limit=limit)


@router.get("/search", response_model=List[SPDV])
async def search_spdvs(
    *,
    db: AsyncSession = Depends(get_db),
    keyword: str = Query(..., description="Từ khóa tìm kiếm (tên hoặc mô tả)"),
    skip: int = Query(0, ge=0, description="Số lượng bản ghi bỏ qua"),
    limit: int = Query(100, ge=1, le=1000, description="Số lượng bản ghi tối đa"),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Tìm kiếm sản phẩm dịch vụ theo tên hoặc mô tả.
    """
    return await spdv.search_spdv(db, keyword=keyword, skip=skip, limit=limit)


@router.get("/next-id", response_model=Dict[str, str])
async def get_next_ma_spdv(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy mã sản phẩm dịch vụ tiếp theo.
    """
    next_ma_spdv = await spdv.get_next_ma_spdv(db)
    return {"maspdv": next_ma_spdv}


@router.get("/check/{ma_spdv}", response_model=Dict[str, bool])
async def check_ma_spdv_exists(
    *,
    db: AsyncSession = Depends(get_db),
    ma_spdv: str = Path(..., description="Mã sản phẩm dịch vụ"),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Kiểm tra mã sản phẩm dịch vụ đã tồn tại chưa.
    """
    exists = await spdv.exists_ma_spdv(db, ma_spdv=ma_spdv)
    return {"exists": exists}


@router.get("/{ma_spdv}", response_model=SPDV)
async def read_spdv(
    *,
    db: AsyncSession = Depends(get_db),
    ma_spdv: str = Path(..., description="Mã sản phẩm dịch vụ"),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy thông tin sản phẩm dịch vụ theo mã.
    """
    result = await spdv.get_by_ma_spdv(db, ma_spdv=ma_spdv)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy sản phẩm dịch vụ"
        )
    return result


@router.put("/{ma_spdv}", response_model=SPDV)
async def update_spdv(
    *,
    db: AsyncSession = Depends(get_db),
    ma_spdv: str = Path(..., description="Mã sản phẩm dịch vụ"),
    spdv_in: SPDVUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Cập nhật thông tin sản phẩm dịch vụ.
    """
    result = await spdv.get_by_ma_spdv(db, ma_spdv=ma_spdv)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy sản phẩm dịch vụ"
        )
    
    return await spdv.update(db=db, db_obj=result, obj_in=spdv_in)


@router.delete("/{ma_spdv}", response_model=SPDV)
async def delete_spdv(
    *,
    db: AsyncSession = Depends(get_db),
    ma_spdv: str = Path(..., description="Mã sản phẩm dịch vụ"),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Xóa sản phẩm dịch vụ.
    """
    result = await spdv.get_by_ma_spdv(db, ma_spdv=ma_spdv)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy sản phẩm dịch vụ"
        )
    
    return await spdv.remove(db=db, id=ma_spdv)