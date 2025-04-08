from sqlalchemy import Column, String, DateTime, Numeric, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.base_class import Base


class HoaDon(Base):
    """Hóa đơn model."""
    
    # Loại bỏ id từ Base
    id = None
    
    __tablename__ = "hoadon"
    
    soct = Column(String(10), primary_key=True, index=True)
    ngaylap = Column(DateTime, nullable=False, index=True)
    makh = Column(String(10), ForeignKey("khachhang.makh"), nullable=False, index=True)
    tenkh = Column(String(150), nullable=False)
    hinhthuctt = Column(String(50), nullable=False)
    tkno = Column(String(10), ForeignKey("tkkt.matk"), nullable=False)
    diengiai = Column(Text, nullable=True)
    tkcodt = Column(String(10), ForeignKey("tkkt.matk"), nullable=False)
    tkcothue = Column(String(10), ForeignKey("tkkt.matk"), nullable=False)
    thuesuat = Column(Numeric(5, 2), nullable=False)
    tienthue = Column(Numeric(18, 2), nullable=False)
    tyleck = Column(Numeric(5, 2), default=0)
    tkchietkhau = Column(String(10), ForeignKey("tkkt.matk"), nullable=True)
    tienck = Column(Numeric(18, 2), default=0)
    tiendt = Column(Numeric(18, 2), nullable=False)
    tientt = Column(Numeric(18, 2), nullable=False)
    
    # Define relationships if you're using them
    chi_tiet = relationship("CTHoaDon", back_populates="hoa_don", cascade="all, delete-orphan")