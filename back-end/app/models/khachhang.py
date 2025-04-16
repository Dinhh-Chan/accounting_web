from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.base_class import Base


class KhachHang(Base):
    """Khách hàng model."""
    
    # Loại bỏ id từ Base
    id = None
    
    __tablename__ = "khachhang"
    
    makh = Column(String(10), primary_key=True, index=True)
    tenkh = Column(String(100), nullable=False)
    diachi = Column(String(150), nullable=False)
    sdt = Column(String(10), nullable=True)
    email = Column(String(100), nullable=True)
    masothue = Column(String(15), nullable=True, index=True)
    phanloai = Column(String(50), nullable=True)
    
    # Relationships
    hoa_don = relationship("HoaDon", back_populates="khach_hang")
    phieu_giam_gia = relationship("PhieuGiamGia", back_populates="khach_hang")