from typing import Any, Dict, List, Optional, Union, Tuple
from datetime import datetime, date
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_, between

from app.services.base import CRUDBase
from app.models.phieugiamgia import PhieuGiamGia
from app.models.ct_phieu import CTPhieu
from app.dto.phieugiamgia import PhieuGiamGiaCreate, PhieuGiamGiaUpdate


class CRUDPhieuGiamGia(CRUDBase[PhieuGiamGia, PhieuGiamGiaCreate, PhieuGiamGiaUpdate]):
    async def get_by_so_phieu(self, db: Session, so_phieu: str) -> Optional[PhieuGiamGia]:
        """
        Get a discount voucher by ID.
        
        Args:
            db: Database session
            so_phieu: Voucher ID
            
        Returns:
            The voucher if found, None otherwise
        """
        query = select(self.model).where(self.model.sophieu == so_phieu)
        result = await db.execute(query)
        return result.scalars().first()
    
    async def exists_so_phieu(self, db: Session, so_phieu: str) -> bool:
        """
        Check if a discount voucher exists by ID.
        
        Args:
            db: Database session
            so_phieu: Voucher ID
            
        Returns:
            True if the voucher exists, False otherwise
        """
        query = select(self.model).where(self.model.sophieu == so_phieu)
        result = await db.execute(query)
        return result.scalars().first() is not None
    
    async def get_next_so_phieu(self, db: Session) -> str:
        """
        Generate the next voucher ID.
        
        Args:
            db: Database session
            
        Returns:
            Next available voucher ID (PG0001, PG0002, etc.)
        """
        # Find the max ID
        query = select(func.max(self.model.sophieu)).where(self.model.sophieu.like("PG%"))
        result = await db.execute(query)
        max_id = result.scalar()
        
        if not max_id:
            return "PG0001"
        
        # Extract the numeric part and increment
        num = int(max_id[2:]) + 1
        return f"PG{num:04d}"
    
    async def get_with_details(self, db: Session, so_phieu: str) -> Optional[Dict[str, Any]]:
        """
        Get a discount voucher with its line items.
        
        Args:
            db: Database session
            so_phieu: Voucher ID
            
        Returns:
            Dict with voucher and its line items if found, None otherwise
        """
        # Get the voucher
        voucher_query = select(self.model).where(self.model.sophieu == so_phieu)
        voucher_result = await db.execute(voucher_query)
        voucher = voucher_result.scalars().first()
        
        if not voucher:
            return None
        
        # Get the line items
        items_query = select(CTPhieu).where(CTPhieu.sophieu == so_phieu)
        items_result = await db.execute(items_query)
        items = items_result.scalars().all()
        
        # Combine into a dict
        return {
            "phieu_giam_gia": voucher,
            "chi_tiet": items
        }
    
    async def create_with_details(self, db: Session, *, obj_in: PhieuGiamGiaCreate) -> PhieuGiamGia:
        """
        Create a discount voucher with its line items.
        
        Args:
            db: Database session
            obj_in: Voucher data including line items
            
        Returns:
            Created voucher
        """
        # Generate next ID
        so_phieu = await self.get_next_so_phieu(db)
        
        # Extract line items data
        chi_tiet_data = obj_in.chi_tiet
        
        # Create voucher without line items
        obj_in_data = obj_in.dict(exclude={"chi_tiet"})
        db_obj = PhieuGiamGia(sophieu=so_phieu, **obj_in_data)
        
        # Add to session
        db.add(db_obj)
        
        # Create line items
        for item in chi_tiet_data:
            item_data = item.dict()
            db_item = CTPhieu(sophieu=so_phieu, **item_data)
            db.add(db_item)
        
        # Commit all changes
        await db.commit()
        await db.refresh(db_obj)
        
        return db_obj
    
    async def get_by_ma_kh(self, db: Session, ma_kh: str) -> List[PhieuGiamGia]:
        """
        Get all discount vouchers for a customer.
        
        Args:
            db: Database session
            ma_kh: Customer ID
            
        Returns:
            List of vouchers for the customer
        """
        query = select(self.model).where(self.model.makh == ma_kh).order_by(self.model.ngaylap.desc())
        result = await db.execute(query)
        return result.scalars().all()
    
    async def get_by_so_ct(self, db: Session, so_ct: str) -> List[PhieuGiamGia]:
        """
        Get all discount vouchers for an invoice.
        
        Args:
            db: Database session
            so_ct: Invoice ID
            
        Returns:
            List of vouchers for the invoice
        """
        query = select(self.model).where(self.model.soct == so_ct).order_by(self.model.ngaylap)
        result = await db.execute(query)
        return result.scalars().all()
    
    async def get_by_date_range(
        self, 
        db: Session, 
        start_date: date,
        end_date: date
    ) -> List[PhieuGiamGia]:
        """
        Get discount vouchers within a date range.
        
        Args:
            db: Database session
            start_date: Start date (inclusive)
            end_date: End date (inclusive)
            
        Returns:
            List of vouchers within the date range
        """
        query = select(self.model).where(
            between(
                func.date(self.model.ngaylap),
                start_date,
                end_date
            )
        ).order_by(self.model.ngaylap)
        
        result = await db.execute(query)
        return result.scalars().all()
    
    async def get_discount_by_customer(
        self,
        db: Session,
        start_date: date,
        end_date: date
    ) -> List[Dict[str, Any]]:
        """
        Get discounts aggregated by customer within a date range.
        
        Args:
            db: Database session
            start_date: Start date (inclusive)
            end_date: End date (inclusive)
            
        Returns:
            List of dicts with customer info and discount amounts
        """
        query = select(
            self.model.makh,
            func.max(self.model.tenkh).label("tenkh"),
            func.sum(self.model.tiendt).label("total_discount"),
            func.sum(self.model.tienthue).label("total_tax"),
            func.sum(self.model.tientt).label("total_amount"),
            func.count(self.model.sophieu).label("voucher_count")
        ).where(
            between(
                func.date(self.model.ngaylap),
                start_date,
                end_date
            )
        ).group_by(
            self.model.makh
        ).order_by(
            func.sum(self.model.tiendt).desc()
        )
        
        result = await db.execute(query)
        return [row._asdict() for row in result.all()]
    
    async def get_discount_by_product(
        self,
        db: Session,
        start_date: date,
        end_date: date
    ) -> List[Dict[str, Any]]:
        """
        Get discounts aggregated by product within a date range.
        
        Args:
            db: Database session
            start_date: Start date (inclusive)
            end_date: End date (inclusive)
            
        Returns:
            List of dicts with product info and discount amounts
        """
        query = select(
            CTPhieu.maspdv,
            func.sum(CTPhieu.soluong * CTPhieu.dongia).label("total_discount"),
            func.sum(CTPhieu.soluong).label("total_quantity")
        ).join(
            self.model,
            CTPhieu.sophieu == self.model.sophieu
        ).where(
            between(
                func.date(self.model.ngaylap),
                start_date,
                end_date
            )
        ).group_by(
            CTPhieu.maspdv
        ).order_by(
            func.sum(CTPhieu.soluong * CTPhieu.dongia).desc()
        )
        
        result = await db.execute(query)
        return [row._asdict() for row in result.all()]
    
    async def get_total_discount(
        self,
        db: Session,
        start_date: date,
        end_date: date
    ) -> Dict[str, Decimal]:
        """
        Get total discount within a date range.
        
        Args:
            db: Database session
            start_date: Start date (inclusive)
            end_date: End date (inclusive)
            
        Returns:
            Dict with total discount, tax, and amount
        """
        query = select(
            func.sum(self.model.tiendt).label("total_discount"),
            func.sum(self.model.tienthue).label("total_tax"),
            func.sum(self.model.tientt).label("total_amount"),
            func.count(self.model.sophieu).label("voucher_count")
        ).where(
            between(
                func.date(self.model.ngaylap),
                start_date,
                end_date
            )
        )
        
        result = await db.execute(query)
        row = result.first()
        
        if not row:
            return {
                "total_discount": Decimal("0"),
                "total_tax": Decimal("0"),
                "total_amount": Decimal("0"),
                "voucher_count": 0
            }
            
        return row._asdict()


# Create an instance for importing
phieugiamgia = CRUDPhieuGiamGia(PhieuGiamGia)