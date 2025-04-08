from typing import Any, Dict, List, Optional, Union
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.services.base import CRUDBase
from app.models.tkkt import TKKT
from app.dto.tkkt import TKKTCreate, TKKTUpdate


class CRUDTKKT(CRUDBase[TKKT, TKKTCreate, TKKTUpdate]):
    async def get_by_ma_tk(self, db: Session, ma_tk: str) -> Optional[TKKT]:
        """
        Get an accounting account by ID.
        
        Args:
            db: Database session
            ma_tk: Account ID
            
        Returns:
            The account if found, None otherwise
        """
        query = select(self.model).where(self.model.MaTK == ma_tk)
        result = await db.execute(query)
        return result.scalars().first()
    
    async def exists_ma_tk(self, db: Session, ma_tk: str) -> bool:
        """
        Check if an accounting account exists by ID.
        
        Args:
            db: Database session
            ma_tk: Account ID
            
        Returns:
            True if the account exists, False otherwise
        """
        query = select(self.model).where(self.model.MaTK == ma_tk)
        result = await db.execute(query)
        return result.scalars().first() is not None
    
    async def get_by_cap_tk(self, db: Session, cap_tk: int) -> List[TKKT]:
        """
        Get accounts by level.
        
        Args:
            db: Database session
            cap_tk: Account level
            
        Returns:
            List of accounts at the specified level
        """
        query = select(self.model).where(self.model.CapTK == cap_tk)
        result = await db.execute(query)
        return result.scalars().all()
    
    async def search_tkkt(
        self, 
        db: Session, 
        *, 
        keyword: str,
        skip: int = 0, 
        limit: int = 100
    ) -> List[TKKT]:
        """
        Search for accounts by ID or name.
        
        Args:
            db: Database session
            keyword: Search keyword
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of matching accounts
        """
        search_term = f"%{keyword}%"
        query = select(self.model).where(
            (self.model.MaTK.ilike(search_term)) |
            (self.model.TenTK.ilike(search_term))
        ).offset(skip).limit(limit)
        
        result = await db.execute(query)
        return result.scalars().all()


# Create an instance for importing
tkkt = CRUDTKKT(TKKT)