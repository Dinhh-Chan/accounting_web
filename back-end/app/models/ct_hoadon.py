from sqlalchemy import Column, String, Numeric, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class CTHoaDon(Base):
    """Chi tiết hóa đơn model."""
    
    __tablename__ = "ct_hoadon"
    
    soct = Column(String(10), ForeignKey("hoadon.soct"), primary_key=True)
    maspdv = Column(String(10), ForeignKey("spdv.maspdv"), primary_key=True)
    soluong = Column(Numeric(18, 2), nullable=False)
    dvt = Column(String(10), nullable=False)
    dongia = Column(Numeric(18, 2), nullable=False)
    
    # Relationships
    hoa_don = relationship("HoaDon", back_populates="chi_tiet")
    san_pham = relationship("SPDV", back_populates="ct_hoa_don") 