from typing import Any, Dict, List, Optional, Union
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select, and_

from app.services.base import CRUDBase
from app.models.banggia import BangGia
from app.dto.banggia import BangGiaCreate, BangGiaUpdate


class CRUDBangGia(CRUDBase[BangGia, BangGiaCreate, BangGiaUpdate]):
    async def get_by_ma_spdv_and_date(
        self, 
        db: Session, 
        ma_spdv: str, 
        ngay_hl: datetime
    ) -> Optional[BangGia]:
        """
        Get a price entry by product ID and effective date.
        
        Args:
            db: Database session
            ma_spdv: Product ID
            ngay_hl: Effective date
            
        Returns:
            The price entry if found, None otherwise
        """
        # Loại bỏ thông tin múi giờ từ datetime trước khi truy vấn
        naive_ngay_hl = ngay_hl.replace(tzinfo=None)
        
        query = select(self.model).where(
            and_(
                self.model.maspdv == ma_spdv,
                self.model.ngayhl == naive_ngay_hl
            )
        )
        result = await db.execute(query)
        return result.scalars().first()
    
    async def get_by_ma_spdv(
        self, 
        db: Session, 
        ma_spdv: str
    ) -> List[BangGia]:
        """
        Get all price entries for a product.
        
        Args:
            db: Database session
            ma_spdv: Product ID
            
        Returns:
            List of price entries for the product
        """
        query = select(self.model).where(self.model.maspdv == ma_spdv).order_by(self.model.ngayhl.desc())
        result = await db.execute(query)
        return result.scalars().all()
    
    async def get_latest_price(
        self, 
        db: Session, 
        ma_spdv: str, 
        date: Optional[datetime] = None
    ) -> Optional[BangGia]:
        """
        Get the latest price for a product, effective on or before the given date.
        
        Args:
            db: Database session
            ma_spdv: Product ID
            date: Reference date (default: current date)
            
        Returns:
            The latest price entry if found, None otherwise
        """
        if date is None:
            date = datetime.utcnow()
        else:
            # Loại bỏ thông tin múi giờ
            date = date.replace(tzinfo=None)
            
        query = select(self.model).where(
            and_(
                self.model.maspdv == ma_spdv,
                self.model.ngayhl <= date
            )
        ).order_by(self.model.ngayhl.desc())
        
        result = await db.execute(query)
        return result.scalars().first()


# Create an instance for importing
banggia = CRUDBangGia(BangGia)