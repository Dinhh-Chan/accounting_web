from typing import Any, Dict, List, Optional, Union
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.services.base import CRUDBase
from app.models.khachhang import KhachHang
from app.dto.khachhang import KhachHangCreate, KhachHangUpdate


class CRUDKhachHang(CRUDBase[KhachHang, KhachHangCreate, KhachHangUpdate]):
    async def get_by_ma_kh(self, db: Session, ma_kh: str) -> Optional[KhachHang]:
        """
        Get a customer by their ID.
        
        Args:
            db: Database session
            ma_kh: Customer ID
            
        Returns:
            The customer if found, None otherwise
        """
        query = select(self.model).where(self.model.makh == ma_kh)
        result = await db.execute(query)
        return result.scalars().first()
    
    async def get_by_ma_so_thue(self, db: Session, ma_so_thue: str) -> Optional[KhachHang]:
        """
        Get a customer by their tax ID.
        
        Args:
            db: Database session
            ma_so_thue: Customer tax ID
            
        Returns:
            The customer if found, None otherwise
        """
        query = select(self.model).where(self.model.masothue == ma_so_thue)
        result = await db.execute(query)
        return result.scalars().first()
    
    async def exists_ma_kh(self, db: Session, ma_kh: str) -> bool:
        """
        Check if a customer exists by their ID.
        
        Args:
            db: Database session
            ma_kh: Customer ID
            
        Returns:
            True if the customer exists, False otherwise
        """
        query = select(self.model).where(self.model.makh == ma_kh)
        result = await db.execute(query)
        return result.scalars().first() is not None
    
    async def exists_ma_so_thue(self, db: Session, ma_so_thue: str) -> bool:
        """
        Check if a customer exists by their tax ID.
        
        Args:
            db: Database session
            ma_so_thue: Customer tax ID
            
        Returns:
            True if the customer exists, False otherwise
        """
        query = select(self.model).where(self.model.masothue == ma_so_thue)
        result = await db.execute(query)
        return result.scalars().first() is not None
    
    async def get_next_ma_kh(self, db: Session) -> str:
        """
        Generate the next customer ID.
        
        Args:
            db: Database session
            
        Returns:
            Next available customer ID (KH0001, KH0002, etc.)
        """
        # Find the max customer ID
        query = select(func.max(self.model.makh)).where(self.model.makh.like("KH%"))
        result = await db.execute(query)
        max_id = result.scalar()
        
        if not max_id:
            return "KH0001"
        
        # Extract the numeric part and increment
        num = int(max_id[2:]) + 1
        return f"KH{num:04d}"
    
    async def create_with_id(self, db: Session, *, obj_in: KhachHangCreate) -> KhachHang:
        """
        Create a customer with an auto-generated ID.
        
        Args:
            db: Database session
            obj_in: Customer data
            
        Returns:
            Created customer
        """
        # Generate next ID
        ma_kh = await self.get_next_ma_kh(db)
        
        # Create dict from pydantic model
        obj_in_data = obj_in.dict()
        
        # Create model instance
        db_obj = KhachHang(makh=ma_kh, **obj_in_data)
        
        # Add to session and commit
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        
        return db_obj
    
    async def search_khachhang(
        self, 
        db: Session, 
        *, 
        keyword: str,
        skip: int = 0, 
        limit: int = 100
    ) -> List[KhachHang]:
        """
        Search for customers by name, address, or tax ID.
        
        Args:
            db: Database session
            keyword: Search keyword
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of matching customers
        """
        search_term = f"%{keyword}%"
        query = select(self.model).where(
            (self.model.tenkh.ilike(search_term)) |
            (self.model.diachi.ilike(search_term)) |
            (self.model.masothue.ilike(search_term))
        ).offset(skip).limit(limit)
        
        result = await db.execute(query)
        return result.scalars().all()


# Create an instance for importing
khachhang = CRUDKhachHang(KhachHang)