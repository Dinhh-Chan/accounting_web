from typing import Any, Dict, List, Optional, Union
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_

from app.services.base import CRUDBase
from app.models.ct_phieu import CTPhieu
from app.dto.ct_phieu import CTPhieuCreate, CTPhieuUpdate


class CRUDCTPhieu(CRUDBase[CTPhieu, CTPhieuCreate, CTPhieuUpdate]):
    async def get_by_so_phieu(self, db: Session, so_phieu: str) -> List[CTPhieu]:
        """
        Get all line items for a discount voucher.
        
        Args:
            db: Database session
            so_phieu: Voucher ID
            
        Returns:
            List of line items for the voucher
        """
        query = select(self.model).where(self.model.sophieu == so_phieu)
        result = await db.execute(query)
        return result.scalars().all()
    
    async def get_by_so_phieu_and_ma_spdv(
        self, 
        db: Session, 
        so_phieu: str, 
        ma_spdv: str
    ) -> Optional[CTPhieu]:
        """
        Get a specific line item by voucher ID and product ID.
        
        Args:
            db: Database session
            so_phieu: Voucher ID
            ma_spdv: Product ID
            
        Returns:
            The line item if found, None otherwise
        """
        query = select(self.model).where(
            and_(
                self.model.sophieu == so_phieu,
                self.model.maspdv == ma_spdv
            )
        )
        result = await db.execute(query)
        return result.scalars().first()
    
    async def delete_by_so_phieu(self, db: Session, so_phieu: str) -> int:
        """
        Delete all line items for a voucher.
        
        Args:
            db: Database session
            so_phieu: Voucher ID
            
        Returns:
            Number of line items deleted
        """
        # Get all line items to be deleted
        items = await self.get_by_so_phieu(db, so_phieu)
        count = len(items)
        
        # Delete each item
        for item in items:
            await db.delete(item)
        
        await db.commit()
        return count
    
    async def update_by_so_phieu_and_ma_spdv(
        self, 
        db: Session, 
        so_phieu: str, 
        ma_spdv: str, 
        obj_in: Union[CTPhieuUpdate, Dict[str, Any]]
    ) -> Optional[CTPhieu]:
        """
        Update a specific line item.
        
        Args:
            db: Database session
            so_phieu: Voucher ID
            ma_spdv: Product ID
            obj_in: Data to update
            
        Returns:
            Updated line item if found and updated, None otherwise
        """
        db_obj = await self.get_by_so_phieu_and_ma_spdv(db, so_phieu, ma_spdv)
        
        if not db_obj:
            return None
            
        # Update the item
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
            
        for field in update_data:
            if hasattr(db_obj, field):
                setattr(db_obj, field, update_data[field])
                
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        
        return db_obj
    
    async def get_product_discount_frequency(
        self,
        db: Session,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get most frequently discounted products.
        
        Args:
            db: Database session
            limit: Maximum number of products to return
            
        Returns:
            List of dicts with product ID and discount frequency
        """
        query = select(
            self.model.maspdv,
            func.count(self.model.sophieu).label("frequency")
        ).group_by(
            self.model.maspdv
        ).order_by(
            func.count(self.model.sophieu).desc()
        ).limit(limit)
        
        result = await db.execute(query)
        return [row._asdict() for row in result.all()]
    
    async def get_product_discount_amount(
        self,
        db: Session,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get products with highest discount amounts.
        
        Args:
            db: Database session
            limit: Maximum number of products to return
            
        Returns:
            List of dicts with product ID and discount amount
        """
        query = select(
            self.model.maspdv,
            func.sum(self.model.soluong * self.model.dongia).label("discount_amount")
        ).group_by(
            self.model.maspdv
        ).order_by(
            func.sum(self.model.soluong * self.model.dongia).desc()
        ).limit(limit)
        
        result = await db.execute(query)
        return [row._asdict() for row in result.all()]


# Create an instance for importing
ct_phieu = CRUDCTPhieu(CTPhieu)