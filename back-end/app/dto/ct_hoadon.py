from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, validator


# Shared properties
class CTHoaDonBase(BaseModel):
    SoCT: str = Field(..., description="Số chứng từ", example="HD0001")
    MaSPDV: str = Field(..., description="Mã sản phẩm dịch vụ", example="SP0001")
    SoLuong: Decimal = Field(..., description="Số lượng", example=1.00)
    DVT: str = Field(..., description="Đơn vị tính", example="Bản")
    DonGia: Decimal = Field(..., description="Đơn giá", example=10000000.00)
    
    @validator('SoLuong')
    def validate_soluong(cls, v):
        if v <= 0:
            raise ValueError('Số lượng phải lớn hơn 0')
        return v
    
    @validator('DonGia')
    def validate_dongia(cls, v):
        if v <= 0:
            raise ValueError('Đơn giá phải lớn hơn 0')
        return v


# Properties to receive on CTHoaDon creation
class CTHoaDonCreate(BaseModel):
    MaSPDV: str = Field(..., description="Mã sản phẩm dịch vụ", example="SP0001")
    SoLuong: Decimal = Field(..., description="Số lượng", example=1.00)
    DVT: str = Field(..., description="Đơn vị tính", example="Bản")
    DonGia: Decimal = Field(..., description="Đơn giá", example=10000000.00)


# Properties to receive on CTHoaDon update
class CTHoaDonUpdate(BaseModel):
    SoLuong: Optional[Decimal] = None
    DVT: Optional[str] = None
    DonGia: Optional[Decimal] = None


# Properties shared by models stored in DB
class CTHoaDonInDBBase(CTHoaDonBase):
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True


# Properties to return to client
class CTHoaDon(CTHoaDonInDBBase):
    pass