from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, validator


# Shared properties
class TKKTBase(BaseModel):
    TenTK: str = Field(..., description="Tên tài khoản kế toán", example="Doanh thu bán hàng")
    CapTK: int = Field(..., description="Cấp tài khoản", example=1, ge=1, le=5)
    
    @validator('CapTK')
    def validate_captk(cls, v):
        if v < 1 or v > 5:
            raise ValueError('Cấp tài khoản phải từ 1 đến 5')
        return v


# Properties to receive on TKKT creation
class TKKTCreate(TKKTBase):
    MaTK: str = Field(..., description="Mã tài khoản kế toán", example="511")


# Properties to receive on TKKT update
class TKKTUpdate(TKKTBase):
    TenTK: Optional[str] = None
    CapTK: Optional[int] = None


# Properties shared by models stored in DB
class TKKTInDBBase(TKKTBase):
    MaTK: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True


# Properties to return to client
class TKKT(TKKTInDBBase):
    pass