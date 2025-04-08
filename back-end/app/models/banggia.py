from sqlalchemy import Column, String, DateTime, Numeric, ForeignKey
from datetime import datetime

from app.db.base_class import Base


class BangGia(Base):
    """Bảng giá model."""
    
    # Loại bỏ id từ Base
    id = None
    
    __tablename__ = "banggia"
    
    maspdv = Column(String(10), ForeignKey("spdv.maspdv"), primary_key=True)
    ngayhl = Column(DateTime, primary_key=True)
    giaban = Column(Numeric(18, 2), nullable=False)