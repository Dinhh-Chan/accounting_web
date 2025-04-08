from sqlalchemy import Column, String, DateTime, Numeric, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.base_class import Base


class PhieuGiamGia(Base):
    """Phiếu giảm giá model."""
    
    # Loại bỏ id từ Base
    id = None
    
    __tablename__ = "phieugiamgia"
    
    sophieu = Column(String(10), primary_key=True, index=True)
    ngaylap = Column(DateTime, nullable=False, index=True)
    makh = Column(String(10), ForeignKey("khachhang.makh"), nullable=False, index=True)
    diengiai = Column(Text, nullable=True)
    tknogiamtru = Column(String(10), ForeignKey("tkkt.matk"), nullable=False)
    tkcott = Column(String(10), ForeignKey("tkkt.matk"), nullable=False)
    soct = Column(String(10), ForeignKey("hoadon.soct"), nullable=False, index=True)
    thuesuat = Column(Numeric(5, 2), nullable=False)
    tienthue = Column(Numeric(18, 2), nullable=False)
    tknothue = Column(String(10), ForeignKey("tkkt.matk"), nullable=False)
    tiendt = Column(Numeric(18, 2), nullable=False)
    tientt = Column(Numeric(18, 2), nullable=False)
    
    # Define relationships if you're using them
    chi_tiet = relationship("CTPhieu", back_populates="phieu_giam_gia", cascade="all, delete-orphan")