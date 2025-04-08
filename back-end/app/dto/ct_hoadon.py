from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, validator, condecimal


# Shared properties
class CTHoaDonBase(BaseModel):
    soct: str = Field(..., description="Số chứng từ", example="HD0001")
    maspdv: str = Field(..., description="Mã sản phẩm dịch vụ", example="SP0001")
    soluong: condecimal(ge=0) = Field(..., description="Số lượng", example=2.0)
    dvt: str = Field(..., description="Đơn vị tính", example="Cái")
    dongia: condecimal(ge=0) = Field(..., description="Đơn giá", example=1000000.00)
    
    @validator('soluong')
    def validate_soluong(cls, v):
        if v <= 0:
            raise ValueError('Số lượng phải lớn hơn 0')
        return v
    
    @validator('dongia')
    def validate_dongia(cls, v):
        if v <= 0:
            raise ValueError('Đơn giá phải lớn hơn 0')
        return v


# Properties to receive on CTHoaDon creation
class CTHoaDonCreate(CTHoaDonBase):
    pass


# Properties to receive on CTHoaDon update
class CTHoaDonUpdate(BaseModel):
    soluong: Optional[condecimal(ge=0)] = None
    dvt: Optional[str] = None
    dongia: Optional[condecimal(ge=0)] = None


# Properties shared by models stored in DB
class CTHoaDonInDBBase(CTHoaDonBase):
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Properties to return to client
class CTHoaDon(CTHoaDonInDBBase):
    pass