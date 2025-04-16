from sqlalchemy import Column, String, Numeric, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.base_class import Base


class SPDV(Base):
    """Sản phẩm dịch vụ model."""
    
    # Loại bỏ id từ Base
    id = None
    
    __tablename__ = "spdv"
    
    maspdv = Column(String(10), primary_key=True, index=True)
    tenspdv = Column(String(100), nullable=False)
    dongia = Column(Numeric(18, 2), nullable=False)
    dvt = Column(String(10), nullable=False)
    mota = Column(String(200), nullable=True)
    
    # Relationships
    ct_hoa_don = relationship("CTHoaDon", back_populates="san_pham")
    ct_phieu = relationship("CTPhieu", back_populates="san_pham")