from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.base_class import Base


class TKKT(Base):
    """Tài khoản kế toán model."""
    
    # Loại bỏ id từ Base
    id = None
    
    __tablename__ = "tkkt"
    
    matk = Column(String(10), primary_key=True, index=True)
    tentk = Column(String(100), nullable=False)
    captk = Column(Integer, nullable=False)
    
    # Relationships
    hoa_don_no = relationship("HoaDon", foreign_keys="HoaDon.tkno", back_populates="tk_no")
    hoa_don_co_dt = relationship("HoaDon", foreign_keys="HoaDon.tkcodt", back_populates="tk_co_dt")
    hoa_don_co_thue = relationship("HoaDon", foreign_keys="HoaDon.tkcothue", back_populates="tk_co_thue") 
    hoa_don_chiet_khau = relationship("HoaDon", foreign_keys="HoaDon.tkchietkhau", back_populates="tk_chiet_khau")