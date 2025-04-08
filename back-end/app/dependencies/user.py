from typing import Optional

from fastapi import Depends, HTTPException, status, Request, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.services.user import user_service
from app.dto.auth import TokenPayload
from app.core.config import settings
from app.db.session import get_db

security = HTTPBearer()


async def get_current_user(
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
) -> User:
    """
    Lấy người dùng hiện tại từ token.
    
    Args:
        db: Database session
        authorization: Bearer token header
        
    Returns:
        User hiện tại
        
    Raises:
        HTTPException: Nếu token không hợp lệ hoặc người dùng không tồn tại
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Không có thông tin xác thực",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    try:
        # Kiểm tra và trích xuất token
        parts = authorization.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Sai định dạng xác thực, yêu cầu Bearer token",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        token = parts[1]
            
        # Decode token sử dụng JWT_SECRET_KEY thay vì SECRET_KEY
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        
        # Lấy user_id từ payload
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token không hợp lệ (thiếu user_id)",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
    except (JWTError, ValueError) as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Không thể xác thực thông tin đăng nhập",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Get user
    user = await user_service.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy người dùng"
        )
        
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Lấy người dùng hiện tại đang hoạt động.
    
    Args:
        current_user: User hiện tại
        
    Returns:
        User hiện tại đang hoạt động
        
    Raises:
        HTTPException: Nếu người dùng không hoạt động
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản không hoạt động"
        )
        
    return current_user


async def get_current_superuser(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """
    Lấy người dùng hiện tại với quyền superuser.
    
    Args:
        current_user: User hiện tại đang hoạt động
        
    Returns:
        User hiện tại với quyền superuser
        
    Raises:
        HTTPException: Nếu người dùng không có quyền superuser
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không đủ quyền truy cập"
        )
        
    return current_user