from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, validator


# Shared properties
class DinhMucCKBase(BaseModel):
    MaSPDV: str = Field(..., description="Mã sản phẩm dịch vụ", example="SP0001")
    NgayHL: datetime = Field(..., description="Ngày hiệu lực", example="2023-01-01T00:00:00")
    MucTien: Decimal = Field(..., description="Mức tiền", example=5000000.00)
    TyLeCK: Decimal = Field(..., description="Tỷ lệ chiết khấu", example=5.00)
    
    @validator('TyLeCK')
    def validate_tyleck(cls, v):
        if v < 0 or v > 100:
            raise ValueError('Tỷ lệ chiết khấu phải từ 0 đến 100')
        return v
    
    @validator('MucTien')
    def validate_muctien(cls, v):
        if v < 0:
            raise ValueError('Mức tiền phải lớn hơn hoặc bằng 0')
        return v


# Properties to receive on DinhMucCK creation
class DinhMucCKCreate(DinhMucCKBase):
    pass


# Properties to receive on DinhMucCK update
class DinhMucCKUpdate(DinhMucCKBase):
    MaSPDV: Optional[str] = None
    NgayHL: Optional[datetime] = None
    MucTien: Optional[Decimal] = None
    TyLeCK: Optional[Decimal] = None


# Properties shared by models stored in DB
class DinhMucCKInDBBase(DinhMucCKBase):
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True


# Properties to return to client
class DinhMucCK(DinhMucCKInDBBase):
    pass