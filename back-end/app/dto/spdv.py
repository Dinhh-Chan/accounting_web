from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, validator


# Shared properties
class SPDVBase(BaseModel):
    TenSPDV: str = Field(..., description="Tên sản phẩm dịch vụ", example="Phần mềm quản lý bán hàng")
    DonGia: Decimal = Field(..., description="Đơn giá", example=10000000.00)
    DVT: str = Field(..., description="Đơn vị tính", example="Bản")
    MoTa: Optional[str] = Field(None, description="Mô tả", example="Phần mềm quản lý bán hàng cho mảng phân phối đại lý")
    
    @validator('DonGia')
    def validate_dongia(cls, v):
        if v <= 0:
            raise ValueError('Đơn giá phải lớn hơn 0')
        return v


# Properties to receive on SPDV creation
class SPDVCreate(SPDVBase):
    pass


# Properties to receive on SPDV update
class SPDVUpdate(SPDVBase):
    TenSPDV: Optional[str] = None
    DonGia: Optional[Decimal] = None
    DVT: Optional[str] = None


# Properties shared by models stored in DB
class SPDVInDBBase(SPDVBase):
    MaSPDV: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True


# Properties to return to client
class SPDV(SPDVInDBBase):
    pass