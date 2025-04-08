from typing import List, Optional, Dict, Any
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, validator, condecimal


# Chi tiết hóa đơn Base
class CTHoaDonBase(BaseModel):
    maspdv: str = Field(..., description="Mã sản phẩm dịch vụ", example="SP001")
    soluong: condecimal(ge=0) = Field(..., description="Số lượng", example=2.0)
    dvt: str = Field(..., description="Đơn vị tính", example="Cái")
    dongia: condecimal(ge=0) = Field(..., description="Đơn giá", example=1000000.00)


# Chi tiết hóa đơn Create/Update
class CTHoaDonCreate(CTHoaDonBase):
    pass


# Chi tiết hóa đơn in DB
class CTHoaDon(CTHoaDonBase):
    soct: str = Field(..., description="Số chứng từ", example="HD0001")
    
    class Config:
        from_attributes = True


# Hóa đơn Base
class HoaDonBase(BaseModel):
    ngaylap: datetime = Field(..., description="Ngày lập hóa đơn")
    makh: str = Field(..., description="Mã khách hàng", example="KH0001")
    tenkh: str = Field(..., description="Tên khách hàng", example="Công ty TNHH ABC")
    hinhthuctt: str = Field(..., description="Hình thức thanh toán", example="Chuyển khoản")
    tkno: str = Field(..., description="Tài khoản nợ", example="131")
    diengiai: Optional[str] = Field(None, description="Diễn giải", example="Thanh toán hóa đơn tháng 5")
    tkcodt: str = Field(..., description="Tài khoản có doanh thu", example="511")
    tkcothue: str = Field(..., description="Tài khoản có thuế", example="3331")
    thuesuat: condecimal(ge=0, le=100) = Field(..., description="Thuế suất", example=10.0)
    tienthue: condecimal(ge=0) = Field(..., description="Tiền thuế", example=1000000.00)
    tyleck: condecimal(ge=0, le=100) = Field(0, description="Tỷ lệ chiết khấu", example=5.0)
    tkchietkhau: Optional[str] = Field(None, description="Tài khoản chiết khấu", example="521")
    tienck: condecimal(ge=0) = Field(0, description="Tiền chiết khấu", example=500000.00)
    tiendt: condecimal(ge=0) = Field(..., description="Tiền doanh thu", example=10000000.00)
    tientt: condecimal(ge=0) = Field(..., description="Tiền thanh toán", example=10500000.00)


# Hóa đơn Create
class HoaDonCreate(HoaDonBase):
    chi_tiet: List[CTHoaDonCreate] = Field(..., description="Chi tiết hóa đơn")
    
    @validator('tientt')
    def validate_tientt(cls, v, values):
        if 'tiendt' in values and 'tienthue' in values and 'tienck' in values:
            tiendt = values['tiendt']
            tienthue = values['tienthue']
            tienck = values['tienck']
            expected = tiendt + tienthue - tienck
            if abs(v - expected) > 1:  # Allow for small rounding differences
                raise ValueError(f'Tiền thanh toán phải bằng (Tiền doanh thu + Tiền thuế - Tiền chiết khấu)')
        return v


# Hóa đơn Update
class HoaDonUpdate(BaseModel):
    ngaylap: Optional[datetime] = None
    makh: Optional[str] = None
    tenkh: Optional[str] = None
    hinhthuctt: Optional[str] = None
    tkno: Optional[str] = None
    diengiai: Optional[str] = None
    tkcodt: Optional[str] = None
    tkcothue: Optional[str] = None
    thuesuat: Optional[condecimal(ge=0, le=100)] = None
    tienthue: Optional[condecimal(ge=0)] = None
    tyleck: Optional[condecimal(ge=0, le=100)] = None
    tkchietkhau: Optional[str] = None
    tienck: Optional[condecimal(ge=0)] = None
    tiendt: Optional[condecimal(ge=0)] = None
    tientt: Optional[condecimal(ge=0)] = None


# Hóa đơn in DB
class HoaDon(HoaDonBase):
    soct: str = Field(..., description="Số chứng từ", example="HD0001")
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Hóa đơn with Details
class HoaDonWithDetails(BaseModel):
    hoa_don: HoaDon
    chi_tiet: List[CTHoaDon]