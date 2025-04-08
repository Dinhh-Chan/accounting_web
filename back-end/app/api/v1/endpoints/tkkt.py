from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dependencies.user import get_current_active_user
from app.services.tkkt import tkkt
from app.models.user import User
from app.dto.tkkt import TKKT, TKKTCreate, TKKTUpdate

router = APIRouter()


@router.post("", response_model=TKKT, status_code=status.HTTP_201_CREATED)
async def create_tkkt(
    *,
    db: AsyncSession = Depends(get_db),
    tkkt_in: TKKTCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Tạo tài khoản kế toán mới.
    """
    # Kiểm tra xem mã tài khoản đã tồn tại chưa
    if await tkkt.exists_ma_tk(db, ma_tk=tkkt_in.matk):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mã tài khoản đã tồn tại"
        )
    
    return await tkkt.create(db=db, obj_in=tkkt_in)


@router.get("", response_model=List[TKKT])
async def read_tkkts(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0, description="Số lượng bản ghi bỏ qua"),
    limit: int = Query(100, ge=1, le=1000, description="Số lượng bản ghi tối đa"),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy danh sách tài khoản kế toán.
    """
    return await tkkt.get_multi(db, skip=skip, limit=limit)


@router.get("/search", response_model=List[TKKT])
async def search_tkkts(
    *,
    db: AsyncSession = Depends(get_db),
    keyword: str = Query(..., description="Từ khóa tìm kiếm (mã hoặc tên tài khoản)"),
    skip: int = Query(0, ge=0, description="Số lượng bản ghi bỏ qua"),
    limit: int = Query(100, ge=1, le=1000, description="Số lượng bản ghi tối đa"),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Tìm kiếm tài khoản kế toán theo mã hoặc tên.
    """
    return await tkkt.search_tkkt(db, keyword=keyword, skip=skip, limit=limit)


@router.get("/level/{cap_tk}", response_model=List[TKKT])
async def read_tkkts_by_level(
    cap_tk: int = Path(..., ge=1, le=5, description="Cấp tài khoản"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy danh sách tài khoản kế toán theo cấp.
    """
    return await tkkt.get_by_cap_tk(db, cap_tk=cap_tk)


@router.get("/check/{ma_tk}", response_model=Dict[str, bool])
async def check_ma_tk_exists(
    *,
    db: AsyncSession = Depends(get_db),
    ma_tk: str = Path(..., description="Mã tài khoản kế toán"),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Kiểm tra mã tài khoản kế toán đã tồn tại chưa.
    """
    exists = await tkkt.exists_ma_tk(db, ma_tk=ma_tk)
    return {"exists": exists}


@router.get("/{ma_tk}", response_model=TKKT)
async def read_tkkt(
    *,
    db: AsyncSession = Depends(get_db),
    ma_tk: str = Path(..., description="Mã tài khoản kế toán"),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Lấy thông tin tài khoản kế toán theo mã.
    """
    result = await tkkt.get_by_ma_tk(db, ma_tk=ma_tk)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy tài khoản kế toán"
        )
    return result


@router.put("/{ma_tk}", response_model=TKKT)
async def update_tkkt(
    *,
    db: AsyncSession = Depends(get_db),
    ma_tk: str = Path(..., description="Mã tài khoản kế toán"),
    tkkt_in: TKKTUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Cập nhật thông tin tài khoản kế toán.
    """
    result = await tkkt.get_by_ma_tk(db, ma_tk=ma_tk)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy tài khoản kế toán"
        )
    
    return await tkkt.update(db=db, db_obj=result, obj_in=tkkt_in)


@router.delete("/{ma_tk}", response_model=TKKT)
async def delete_tkkt(
    *,
    db: AsyncSession = Depends(get_db),
    ma_tk: str = Path(..., description="Mã tài khoản kế toán"),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Xóa tài khoản kế toán.
    """
    result = await tkkt.get_by_ma_tk(db, ma_tk=ma_tk)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy tài khoản kế toán"
        )
    
    return await tkkt.remove(db=db, id=ma_tk)