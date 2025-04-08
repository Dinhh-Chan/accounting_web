from sqlalchemy import Column, String, Integer, DateTime
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