from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, validator, condecimal


# Shared properties
class SPDVBase(BaseModel):
    tenspdv: str = Field(..., description="Tên sản phẩm dịch vụ", example="Phần mềm quản lý bán hàng")
    dongia: condecimal(ge=0) = Field(..., description="Đơn giá", example=10000000.00)
    dvt: str = Field(..., description="Đơn vị tính", example="Bản")
    mota: Optional[str] = Field(None, description="Mô tả", example="Phần mềm quản lý bán hàng cho mảng phân phối đại lý")
    
    @validator('dongia')
    def validate_dongia(cls, v):
        if v <= 0:
            raise ValueError('Đơn giá phải lớn hơn 0')
        return v


# Properties to receive on SPDV creation
class SPDVCreate(SPDVBase):
    pass


# Properties to receive on SPDV update
class SPDVUpdate(BaseModel):
    tenspdv: Optional[str] = None
    dongia: Optional[condecimal(ge=0)] = None
    dvt: Optional[str] = None
    mota: Optional[str] = None


# Properties shared by models stored in DB
class SPDVInDBBase(SPDVBase):
    maspdv: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Properties to return to client
class SPDV(SPDVInDBBase):
    pass