from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, validator, condecimal


# Shared properties
class CTPhieuBase(BaseModel):
    sophieu: str = Field(..., description="Số phiếu", example="PG0001")
    maspdv: str = Field(..., description="Mã sản phẩm dịch vụ", example="SP0001")
    soluong: condecimal(ge=0) = Field(..., description="Số lượng", example=1.00)
    dvt: str = Field(..., description="Đơn vị tính", example="Bản")
    dongia: condecimal(ge=0) = Field(..., description="Đơn giá", example=10000000.00)
    
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


# Properties to receive on CTPhieu creation
class CTPhieuCreate(CTPhieuBase):
    pass


# Properties to receive on CTPhieu update
class CTPhieuUpdate(BaseModel):
    soluong: Optional[condecimal(ge=0)] = None
    dvt: Optional[str] = None
    dongia: Optional[condecimal(ge=0)] = None


# Properties shared by models stored in DB
class CTPhieuInDBBase(CTPhieuBase):
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Properties to return to client
class CTPhieu(CTPhieuInDBBase):
    pass