from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, validator


# Shared properties
class BangGiaBase(BaseModel):
    maspdv: str = Field(..., description="Mã sản phẩm dịch vụ", example="SP0001")
    ngayhl: datetime = Field(..., description="Ngày hiệu lực", example="2023-01-01T00:00:00")
    giaban: Decimal = Field(..., description="Giá bán", example=10000000.00)
    
    @validator('giaban')
    def validate_giaban(cls, v):
        if v <= 0:
            raise ValueError('Giá bán phải lớn hơn 0')
        return v


# Properties to receive on BangGia creation
class BangGiaCreate(BangGiaBase):
    pass


# Properties to receive on BangGia update
class BangGiaUpdate(BangGiaBase):
    maspdv: Optional[str] = None
    ngayhl: Optional[datetime] = None
    giaban: Optional[Decimal] = None


# Properties shared by models stored in DB
class BangGiaInDBBase(BangGiaBase):
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Properties to return to client
class BangGia(BangGiaInDBBase):
    pass