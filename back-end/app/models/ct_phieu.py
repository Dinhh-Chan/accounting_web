from sqlalchemy import Column, String, Numeric, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.base_class import Base


class CTPhieu(Base):
    """Chi tiết phiếu giảm giá model."""
    
    # Loại bỏ id từ Base
    id = None
    
    __tablename__ = "ct_phieu"
    
    sophieu = Column(String(10), ForeignKey("phieugiamgia.sophieu"), primary_key=True)
    maspdv = Column(String(10), ForeignKey("spdv.maspdv"), primary_key=True)
    soluong = Column(Numeric(18, 2), nullable=False)
    dvt = Column(String(10), nullable=False)
    dongia = Column(Numeric(18, 2), nullable=False)
    
    # Define relationships if you're using them
    phieu_giam_gia = relationship("PhieuGiamGia", back_populates="chi_tiet")