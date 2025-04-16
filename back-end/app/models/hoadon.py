from sqlalchemy import Column, String, DateTime, Numeric, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.base_class import Base


class HoaDon(Base):
    """Hóa đơn model."""
    
    __tablename__ = "hoadon"
    
    soct = Column(String(10), primary_key=True)
    ngaylap = Column(DateTime, nullable=False)
    makh = Column(String(10), ForeignKey("khachhang.makh"), nullable=False)
    tenkh = Column(String(150), nullable=False)
    hinhthuctt = Column(String(50), nullable=False)
    tkno = Column(String(10), ForeignKey("tkkt.matk"), nullable=False)
    diengiai = Column(Text, nullable=True)
    tkcodt = Column(String(10), ForeignKey("tkkt.matk"), nullable=False)
    tkcothue = Column(String(10), ForeignKey("tkkt.matk"), nullable=False)
    thuesuat = Column(String(10), nullable=False)
    tienthue = Column(Numeric(18, 2), nullable=False)
    tyleck = Column(String(10), nullable=True)
    tkchietkhau = Column(String(10), ForeignKey("tkkt.matk"), nullable=True)
    tienck = Column(Numeric(18, 2), nullable=True)
    tiendt = Column(Numeric(18, 2), nullable=False)
    tientt = Column(Numeric(18, 2), nullable=False)
    
    # Relationships
    chi_tiet = relationship("CTHoaDon", back_populates="hoa_don", cascade="all, delete-orphan")
    khach_hang = relationship("KhachHang", back_populates="hoa_don")
    tk_no = relationship("TKKT", foreign_keys=[tkno], back_populates="hoa_don_no")
    tk_co_dt = relationship("TKKT", foreign_keys=[tkcodt], back_populates="hoa_don_co_dt")
    tk_co_thue = relationship("TKKT", foreign_keys=[tkcothue], back_populates="hoa_don_co_thue")
    tk_chiet_khau = relationship("TKKT", foreign_keys=[tkchietkhau], back_populates="hoa_don_chiet_khau")