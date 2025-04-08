from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, validator


# Shared properties
class KhachHangBase(BaseModel):
    tenkh: str = Field(..., description="Tên khách hàng", example="Công ty TNHH ABC")
    diachi: str = Field(..., description="Địa chỉ", example="123 Đường XYZ, Quận 1, TP.HCM")
    sdt: Optional[str] = Field(None, description="Số điện thoại", example="0901234567")
    email: Optional[str] = Field(None, description="Email", example="contact@abc.com")
    masothue: Optional[str] = Field(None, description="Mã số thuế", example="0123456789")
    phanloai: Optional[str] = Field(None, description="Phân loại khách hàng", example="Doanh nghiệp")
    
    @validator('sdt')
    def validate_phone(cls, v):
        if v is not None and not v.isdigit():
            raise ValueError('Số điện thoại phải là số')
        return v


# Properties to receive on KhachHang creation
class KhachHangCreate(KhachHangBase):
    pass


# Properties to receive on KhachHang update
class KhachHangUpdate(KhachHangBase):
    tenkh: Optional[str] = None
    diachi: Optional[str] = None


# Properties shared by models stored in DB
class KhachHangInDBBase(KhachHangBase):
    makh: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True


# Properties to return to client
class KhachHang(KhachHangInDBBase):
    pass