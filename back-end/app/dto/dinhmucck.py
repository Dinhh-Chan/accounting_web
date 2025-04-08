from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, validator, condecimal


# Shared properties
class DinhMucCKBase(BaseModel):
    maspdv: str = Field(..., description="Mã sản phẩm dịch vụ", example="SP0001")
    ngayhl: datetime = Field(..., description="Ngày hiệu lực", example="2023-01-01T00:00:00")
    muctien: condecimal(ge=0) = Field(..., description="Mức tiền", example=5000000.00)
    tyleck: condecimal(ge=0, le=100) = Field(..., description="Tỷ lệ chiết khấu", example=5.00)
    
    @validator('tyleck')
    def validate_tyleck(cls, v):
        if v < 0 or v > 100:
            raise ValueError('Tỷ lệ chiết khấu phải từ 0 đến 100')
        return v
    
    @validator('muctien')
    def validate_muctien(cls, v):
        if v < 0:
            raise ValueError('Mức tiền phải lớn hơn hoặc bằng 0')
        return v


# Properties to receive on DinhMucCK creation
class DinhMucCKCreate(DinhMucCKBase):
    pass


# Properties to receive on DinhMucCK update
class DinhMucCKUpdate(BaseModel):
    maspdv: Optional[str] = None
    ngayhl: Optional[datetime] = None
    muctien: Optional[condecimal(ge=0)] = None
    tyleck: Optional[condecimal(ge=0, le=100)] = None


# Properties shared by models stored in DB
class DinhMucCKInDBBase(DinhMucCKBase):
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Properties to return to client
class DinhMucCK(DinhMucCKInDBBase):
    pass