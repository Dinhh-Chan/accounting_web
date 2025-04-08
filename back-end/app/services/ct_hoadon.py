from typing import Any, Dict, List, Optional, Union
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_

from app.services.base import CRUDBase
from app.models.ct_hoadon import CTHoaDon
from app.dto.ct_hoadon import CTHoaDonCreate, CTHoaDonUpdate


class CRUDCTHoaDon(CRUDBase[CTHoaDon, CTHoaDonCreate, CTHoaDonUpdate]):
    async def get_by_so_ct(self, db: Session, so_ct: str) -> List[CTHoaDon]:
        """
        Get all line items for an invoice.
        
        Args:
            db: Database session
            so_ct: Invoice ID
            
        Returns:
            List of line items for the invoice
        """
        query = select(self.model).where(self.model.soct == so_ct)
        result = await db.execute(query)
        return result.scalars().all()
    
    async def get_by_so_ct_and_ma_spdv(
        self, 
        db: Session, 
        so_ct: str, 
        ma_spdv: str
    ) -> Optional[CTHoaDon]:
        """
        Get a specific line item by invoice ID and product ID.
        
        Args:
            db: Database session
            so_ct: Invoice ID
            ma_spdv: Product ID
            
        Returns:
            The line item if found, None otherwise
        """
        query = select(self.model).where(
            and_(
                self.model.soct == so_ct,
                self.model.maspdv == ma_spdv
            )
        )
        result = await db.execute(query)
        return result.scalars().first()
    
    async def delete_by_so_ct(self, db: Session, so_ct: str) -> int:
        """
        Delete all line items for an invoice.
        
        Args:
            db: Database session
            so_ct: Invoice ID
            
        Returns:
            Number of line items deleted
        """
        # Get all line items to be deleted
        items = await self.get_by_so_ct(db, so_ct)
        count = len(items)
        
        # Delete each item
        for item in items:
            await db.delete(item)
        
        await db.commit()
        return count
    
    async def update_by_so_ct_and_ma_spdv(
        self, 
        db: Session, 
        so_ct: str, 
        ma_spdv: str, 
        obj_in: Union[CTHoaDonUpdate, Dict[str, Any]]
    ) -> Optional[CTHoaDon]:
        """
        Update a specific line item.
        
        Args:
            db: Database session
            so_ct: Invoice ID
            ma_spdv: Product ID
            obj_in: Data to update
            
        Returns:
            Updated line item if found and updated, None otherwise
        """
        db_obj = await self.get_by_so_ct_and_ma_spdv(db, so_ct, ma_spdv)
        
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
    
    async def get_product_sales_frequency(
        self,
        db: Session,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get most frequently sold products.
        
        Args:
            db: Database session
            limit: Maximum number of products to return
            
        Returns:
            List of dicts with product ID and sales frequency
        """
        query = select(
            self.model.maspdv,
            func.count(self.model.soct).label("frequency")
        ).group_by(
            self.model.maspdv
        ).order_by(
            func.count(self.model.soct).desc()
        ).limit(limit)
        
        result = await db.execute(query)
        return [row._asdict() for row in result.all()]
    
    async def get_product_sales_revenue(
        self,
        db: Session,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get products with highest sales revenue.
        
        Args:
            db: Database session
            limit: Maximum number of products to return
            
        Returns:
            List of dicts with product ID and sales revenue
        """
        query = select(
            self.model.maspdv,
            func.sum(self.model.soluong * self.model.dongia).label("revenue")
        ).group_by(
            self.model.maspdv
        ).order_by(
            func.sum(self.model.soluong * self.model.dongia).desc()
        ).limit(limit)
        
        result = await db.execute(query)
        return [row._asdict() for row in result.all()]


# Create an instance for importing
ct_hoadon = CRUDCTHoaDon(CTHoaDon)