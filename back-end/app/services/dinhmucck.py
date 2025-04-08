from typing import Any, Dict, List, Optional, Union
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select, and_

from app.services.base import CRUDBase
from app.models.dinhmucck import DinhMucCK
from app.dto.dinhmucck import DinhMucCKCreate, DinhMucCKUpdate


class CRUDDinhMucCK(CRUDBase[DinhMucCK, DinhMucCKCreate, DinhMucCKUpdate]):
    async def get_by_ma_spdv_and_date(
        self, 
        db: Session, 
        ma_spdv: str, 
        ngay_hl: datetime
    ) -> Optional[DinhMucCK]:
        """
        Get a discount entry by product ID and effective date.
        
        Args:
            db: Database session
            ma_spdv: Product ID
            ngay_hl: Effective date
            
        Returns:
            The discount entry if found, None otherwise
        """
        query = select(self.model).where(
            and_(
                self.model.MaSPDV == ma_spdv,
                self.model.NgayHL == ngay_hl
            )
        )
        result = await db.execute(query)
        return result.scalars().first()
    
    async def get_by_ma_spdv(
        self, 
        db: Session, 
        ma_spdv: str
    ) -> List[DinhMucCK]:
        """
        Get all discount entries for a product.
        
        Args:
            db: Database session
            ma_spdv: Product ID
            
        Returns:
            List of discount entries for the product
        """
        query = select(self.model).where(self.model.MaSPDV == ma_spdv).order_by(self.model.NgayHL.desc())
        result = await db.execute(query)
        return result.scalars().all()
    
    async def get_latest_discount(
        self, 
        db: Session, 
        ma_spdv: str, 
        date: Optional[datetime] = None,
        amount: Optional[float] = None
    ) -> Optional[DinhMucCK]:
        """
        Get the applicable discount for a product based on date and purchase amount.
        
        Args:
            db: Database session
            ma_spdv: Product ID
            date: Reference date (default: current date)
            amount: Purchase amount to check against discount thresholds
            
        Returns:
            The applicable discount entry if found, None otherwise
        """
        if date is None:
            date = datetime.utcnow()
            
        # Base query for finding entries effective on or before the given date
        query = select(self.model).where(
            and_(
                self.model.MaSPDV == ma_spdv,
                self.model.NgayHL <= date
            )
        )
        
        # If amount is provided, find discounts applicable at that amount
        if amount is not None:
            query = query.where(self.model.MucTien <= amount)
            
        # Order by date (most recent first) and threshold amount (highest first)
        # This gets the most recent discount with the highest applicable threshold
        query = query.order_by(self.model.NgayHL.desc(), self.model.MucTien.desc())
        
        result = await db.execute(query)
        return result.scalars().first()


# Create an instance for importing
dinhmucck = CRUDDinhMucCK(DinhMucCK)