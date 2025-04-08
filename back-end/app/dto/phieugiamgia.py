from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, validator

from app.dto.ct_phieu import CTPhieuCreate, CTPhieu


# Shared properties
class PhieuGiamGiaBase(BaseModel):
    NgayLap: datetime = Field(..., description="Ngày lập", example="2023-01-01T00:00:00")
    MaKH: str = Field(..., description="Mã khách hàng", example="KH0001")
    DienGiai: Optional[str] = Field(None, description="Diễn giải", example="Giảm giá theo chương trình khuyến mãi")
    TKNoGiamTru: str = Field(..., description="Tài khoản nợ giảm trừ", example="521")
    TKCoTT: str = Field(..., description="Tài khoản có thanh toán", example="131")
    SoCT: str = Field(..., description="Số chứng từ hóa đơn", example="HD0001")
    ThueSuat: Decimal = Field(..., description="Thuế suất", example=10.00)
    TienThue: Decimal = Field(..., description="Tiền thuế", example=100000.00)
    TKNoThue: str = Field(..., description="Tài khoản nợ thuế", example="3331")
    TienDT: Decimal = Field(..., description="Tiền doanh thu", example=1000000.00)
    TienTT: Decimal = Field(..., description="Tiền thanh toán", example=1100000.00)
    
    @validator('ThueSuat')
    def validate_thuesuat(cls, v):
        if v < 0 or v > 100:
            raise ValueError('Thuế suất phải từ 0 đến 100')
        return v


# Properties to receive on PhieuGiamGia creation
class PhieuGiamGiaCreate(PhieuGiamGiaBase):
    chi_tiet: List[CTPhieuCreate] = Field(..., description="Chi tiết phiếu giảm giá")


# Properties to receive on PhieuGiamGia update
class PhieuGiamGiaUpdate(PhieuGiamGiaBase):
    NgayLap: Optional[datetime] = None
    MaKH: Optional[str] = None
    DienGiai: Optional[str] = None
    TKNoGiamTru: Optional[str] = None
    TKCoTT: Optional[str] = None
    SoCT: Optional[str] = None
    ThueSuat: Optional[Decimal] = None
    TienThue: Optional[Decimal] = None
    TKNoThue: Optional[str] = None
    TienDT: Optional[Decimal] = None
    TienTT: Optional[Decimal] = None


# Properties shared by models stored in DB
class PhieuGiamGiaInDBBase(PhieuGiamGiaBase):
    SoPhieu: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True


# Properties to return to client
class PhieuGiamGia(PhieuGiamGiaInDBBase):
    pass


# PhieuGiamGia with details
class PhieuGiamGiaWithDetails(PhieuGiamGia):
    chi_tiet: List[CTPhieu] = []