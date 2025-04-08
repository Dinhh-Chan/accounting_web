from typing import Any, Dict, List, Optional, Union
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.services.base import CRUDBase
from app.models.spdv import SPDV
from app.dto.spdv import SPDVCreate, SPDVUpdate


class CRUDSPDV(CRUDBase[SPDV, SPDVCreate, SPDVUpdate]):
    async def get_by_ma_spdv(self, db: Session, ma_spdv: str) -> Optional[SPDV]:
        """
        Get a product/service by ID.
        
        Args:
            db: Database session
            ma_spdv: Product/service ID
            
        Returns:
            The product/service if found, None otherwise
        """
        query = select(self.model).where(self.model.maspdv == ma_spdv)
        result = await db.execute(query)
        return result.scalars().first()
    
    async def exists_ma_spdv(self, db: Session, ma_spdv: str) -> bool:
        """
        Check if a product/service exists by ID.
        
        Args:
            db: Database session
            ma_spdv: Product/service ID
            
        Returns:
            True if the product/service exists, False otherwise
        """
        query = select(self.model).where(self.model.maspdv == ma_spdv)
        result = await db.execute(query)
        return result.scalars().first() is not None
    
    async def get_next_ma_spdv(self, db: Session) -> str:
        """
        Generate the next product/service ID.
        
        Args:
            db: Database session
            
        Returns:
            Next available product/service ID (SP0001, SP0002, etc.)
        """
        # Find the max ID
        query = select(func.max(self.model.maspdv)).where(self.model.maspdv.like("SP%"))
        result = await db.execute(query)
        max_id = result.scalar()
        
        if not max_id:
            return "SP0001"
        
        # Extract the numeric part and increment
        num = int(max_id[2:]) + 1
        return f"SP{num:04d}"
    
    async def create_with_id(self, db: Session, *, obj_in: SPDVCreate) -> SPDV:
        """
        Create a product/service with an auto-generated ID.
        
        Args:
            db: Database session
            obj_in: Product/service data
            
        Returns:
            Created product/service
        """
        # Generate next ID
        ma_spdv = await self.get_next_ma_spdv(db)
        
        # Create dict from pydantic model
        obj_in_data = obj_in.dict()
        
        # Create model instance
        db_obj = SPDV(maspdv=ma_spdv, **obj_in_data)
        
        # Add to session and commit
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        
        return db_obj
    
    async def search_spdv(
        self, 
        db: Session, 
        *, 
        keyword: str,
        skip: int = 0, 
        limit: int = 100
    ) -> List[SPDV]:
        """
        Search for products/services by name or description.
        
        Args:
            db: Database session
            keyword: Search keyword
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of matching products/services
        """
        search_term = f"%{keyword}%"
        query = select(self.model).where(
            (self.model.tenspdv.ilike(search_term)) |
            (self.model.mota.ilike(search_term))
        ).offset(skip).limit(limit)
        
        result = await db.execute(query)
        return result.scalars().all()


# Create an instance for importing
spdv = CRUDSPDV(SPDV)