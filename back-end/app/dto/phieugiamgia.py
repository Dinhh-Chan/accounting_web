from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, validator, condecimal

from app.dto.ct_phieu import CTPhieuCreate, CTPhieu


# Shared properties
class PhieuGiamGiaBase(BaseModel):
    ngaylap: datetime = Field(..., description="Ngày lập", example="2023-01-01T00:00:00")
    makh: str = Field(..., description="Mã khách hàng", example="KH0001")
    diengiai: Optional[str] = Field(None, description="Diễn giải", example="Giảm giá theo chương trình khuyến mãi")
    tknogiamtru: str = Field(..., description="Tài khoản nợ giảm trừ", example="521")
    tkcott: str = Field(..., description="Tài khoản có thanh toán", example="131")
    soct: str = Field(..., description="Số chứng từ hóa đơn", example="HD0001")
    thuesuat: condecimal(ge=0, le=100) = Field(..., description="Thuế suất", example=10.00)
    tienthue: condecimal(ge=0) = Field(..., description="Tiền thuế", example=100000.00)
    tknothue: str = Field(..., description="Tài khoản nợ thuế", example="3331")
    tiendt: condecimal(ge=0) = Field(..., description="Tiền doanh thu", example=1000000.00)
    tientt: condecimal(ge=0) = Field(..., description="Tiền thanh toán", example=1100000.00)
    
    @validator('thuesuat')
    def validate_thuesuat(cls, v):
        if v < 0 or v > 100:
            raise ValueError('Thuế suất phải từ 0 đến 100')
        return v
    
    @validator('tientt')
    def validate_tientt(cls, v, values):
        if 'tiendt' in values and 'tienthue' in values:
            tiendt = values['tiendt']
            tienthue = values['tienthue']
            expected = tiendt + tienthue
            if abs(v - expected) > 1:  # Allow for small rounding differences
                raise ValueError(f'Tiền thanh toán phải bằng (Tiền doanh thu + Tiền thuế)')
        return v


# Properties to receive on PhieuGiamGia creation
class PhieuGiamGiaCreate(PhieuGiamGiaBase):
    chi_tiet: List[CTPhieuCreate] = Field(..., description="Chi tiết phiếu giảm giá")


# Properties to receive on PhieuGiamGia update
class PhieuGiamGiaUpdate(BaseModel):
    ngaylap: Optional[datetime] = None
    makh: Optional[str] = None
    diengiai: Optional[str] = None
    tknogiamtru: Optional[str] = None
    tkcott: Optional[str] = None
    soct: Optional[str] = None
    thuesuat: Optional[condecimal(ge=0, le=100)] = None
    tienthue: Optional[condecimal(ge=0)] = None
    tknothue: Optional[str] = None
    tiendt: Optional[condecimal(ge=0)] = None
    tientt: Optional[condecimal(ge=0)] = None


# Properties shared by models stored in DB
class PhieuGiamGiaInDBBase(PhieuGiamGiaBase):
    sophieu: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Properties to return to client
class PhieuGiamGia(PhieuGiamGiaInDBBase):
    pass


# PhieuGiamGia with details
class PhieuGiamGiaWithDetails(BaseModel):
    phieu_giam_gia: PhieuGiamGia
    chi_tiet: List[CTPhieu] = []
    
    class Config:
        from_attributes = True