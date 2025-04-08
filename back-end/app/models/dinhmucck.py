from sqlalchemy import Column, String, DateTime, Numeric, ForeignKey
from datetime import datetime

from app.db.base_class import Base


class DinhMucCK(Base):
    """Định mức chiết khấu model."""
    
    # Loại bỏ id từ Base
    id = None
    
    __tablename__ = "dinhmucck"
    
    maspdv = Column(String(10), ForeignKey("spdv.maspdv"), primary_key=True)
    ngayhl = Column(DateTime, primary_key=True)
    muctien = Column(Numeric(18, 2), nullable=False)
    tyleck = Column(Numeric(5, 2), nullable=False)