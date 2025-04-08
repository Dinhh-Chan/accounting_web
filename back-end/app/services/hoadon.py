from typing import Any, Dict, List, Optional, Union, Tuple
from datetime import datetime, date
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_, between, or_

from app.services.base import CRUDBase
from app.models.hoadon import HoaDon
from app.models.ct_hoadon import CTHoaDon
from app.dto.hoadon import HoaDonCreate, HoaDonUpdate


class CRUDHoaDon(CRUDBase[HoaDon, HoaDonCreate, HoaDonUpdate]):
    async def get_by_so_ct(self, db: Session, so_ct: str) -> Optional[HoaDon]:
        """
        Get an invoice by ID.
        
        Args:
            db: Database session
            so_ct: Invoice ID
            
        Returns:
            The invoice if found, None otherwise
        """
        query = select(self.model).where(self.model.soct == so_ct)
        result = await db.execute(query)
        return result.scalars().first()
    
    async def exists_so_ct(self, db: Session, so_ct: str) -> bool:
        """
        Check if an invoice exists by ID.
        
        Args:
            db: Database session
            so_ct: Invoice ID
            
        Returns:
            True if the invoice exists, False otherwise
        """
        query = select(self.model).where(self.model.soct == so_ct)
        result = await db.execute(query)
        return result.scalars().first() is not None
    
    async def get_next_so_ct(self, db: Session) -> str:
        """
        Generate the next invoice ID.
        
        Args:
            db: Database session
            
        Returns:
            Next available invoice ID (HD0001, HD0002, etc.)
        """
        # Find the max ID
        query = select(func.max(self.model.soct)).where(self.model.soct.like("HD%"))
        result = await db.execute(query)
        max_id = result.scalar()
        
        if not max_id:
            return "HD0001"
        
        # Extract the numeric part and increment
        num = int(max_id[2:]) + 1
        return f"HD{num:04d}"
    
    async def get_with_details(self, db: Session, so_ct: str) -> Optional[Dict[str, Any]]:
        """
        Get an invoice with its line items.
        
        Args:
            db: Database session
            so_ct: Invoice ID
            
        Returns:
            Dict with invoice and its line items if found, None otherwise
        """
        # Get the invoice
        invoice_query = select(self.model).where(self.model.soct == so_ct)
        invoice_result = await db.execute(invoice_query)
        invoice = invoice_result.scalars().first()
        
        if not invoice:
            return None
        
        # Get the line items
        items_query = select(CTHoaDon).where(CTHoaDon.soct == so_ct)
        items_result = await db.execute(items_query)
        items = items_result.scalars().all()
        
        # Combine into a dict
        return {
            "hoa_don": invoice,
            "chi_tiet": items
        }
    
    async def create_with_details(self, db: Session, *, obj_in: HoaDonCreate) -> HoaDon:
        """
        Create an invoice with its line items.
        
        Args:
            db: Database session
            obj_in: Invoice data including line items
            
        Returns:
            Created invoice
        """
        # Generate next ID
        so_ct = await self.get_next_so_ct(db)
        
        # Extract line items data
        chi_tiet_data = obj_in.chi_tiet
        
        # Create invoice without line items
        obj_in_data = obj_in.dict(exclude={"chi_tiet"})
        db_obj = HoaDon(soct=so_ct, **obj_in_data)
        
        # Add to session
        db.add(db_obj)
        
        # Create line items
        for item in chi_tiet_data:
            item_data = item.dict()
            db_item = CTHoaDon(soct=so_ct, **item_data)
            db.add(db_item)
        
        # Commit all changes
        await db.commit()
        await db.refresh(db_obj)
        
        return db_obj
    
    async def get_by_ma_kh(self, db: Session, ma_kh: str) -> List[HoaDon]:
        """
        Get all invoices for a customer.
        
        Args:
            db: Database session
            ma_kh: Customer ID
            
        Returns:
            List of invoices for the customer
        """
        query = select(self.model).where(self.model.makh == ma_kh).order_by(self.model.ngaylap.desc())
        result = await db.execute(query)
        return result.scalars().all()
    
    async def get_by_date_range(
        self, 
        db: Session, 
        start_date: date,
        end_date: date
    ) -> List[HoaDon]:
        """
        Get invoices within a date range.
        
        Args:
            db: Database session
            start_date: Start date (inclusive)
            end_date: End date (inclusive)
            
        Returns:
            List of invoices within the date range
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
    
    async def get_revenue_by_customer(
        self,
        db: Session,
        start_date: date,
        end_date: date
    ) -> List[Dict[str, Any]]:
        """
        Get revenue aggregated by customer within a date range.
        
        Args:
            db: Database session
            start_date: Start date (inclusive)
            end_date: End date (inclusive)
            
        Returns:
            List of dicts with customer info and revenue
        """
        query = select(
            self.model.makh,
            self.model.tenkh,
            func.sum(self.model.tiendt).label("total_revenue"),
            func.sum(self.model.tienthue).label("total_tax"),
            func.sum(self.model.tienck).label("total_discount"),
            func.sum(self.model.tientt).label("total_payment")
        ).where(
            between(
                func.date(self.model.ngaylap),
                start_date,
                end_date
            )
        ).group_by(
            self.model.makh,
            self.model.tenkh
        ).order_by(
            func.sum(self.model.tiendt).desc()
        )
        
        result = await db.execute(query)
        return [row._asdict() for row in result.all()]
    
    async def get_revenue_by_product(
        self,
        db: Session,
        start_date: date,
        end_date: date
    ) -> List[Dict[str, Any]]:
        """
        Get revenue aggregated by product within a date range.
        
        Args:
            db: Database session
            start_date: Start date (inclusive)
            end_date: End date (inclusive)
            
        Returns:
            List of dicts with product info and revenue
        """
        query = select(
            CTHoaDon.maspdv,
            func.sum(CTHoaDon.soluong * CTHoaDon.dongia).label("total_revenue"),
            func.sum(CTHoaDon.soluong).label("total_quantity")
        ).join(
            self.model,
            CTHoaDon.soct == self.model.soct
        ).where(
            between(
                func.date(self.model.ngaylap),
                start_date,
                end_date
            )
        ).group_by(
            CTHoaDon.maspdv
        ).order_by(
            func.sum(CTHoaDon.soluong * CTHoaDon.dongia).desc()
        )
        
        result = await db.execute(query)
        return [row._asdict() for row in result.all()]
    
    async def get_revenue_by_month(
        self,
        db: Session,
        year: int
    ) -> List[Dict[str, Any]]:
        """
        Get revenue aggregated by month for a year.
        
        Args:
            db: Database session
            year: Year to report on
            
        Returns:
            List of dicts with month and revenue
        """
        query = select(
            func.extract('month', self.model.ngaylap).label("month"),
            func.sum(self.model.tiendt).label("total_revenue"),
            func.sum(self.model.tienthue).label("total_tax"),
            func.sum(self.model.tienck).label("total_discount"),
            func.sum(self.model.tientt).label("total_payment"),
            func.count(self.model.soct).label("invoice_count")
        ).where(
            func.extract('year', self.model.ngaylap) == year
        ).group_by(
            func.extract('month', self.model.ngaylap)
        ).order_by(
            func.extract('month', self.model.ngaylap)
        )
        
        result = await db.execute(query)
        return [row._asdict() for row in result.all()]
    
    async def get_total_revenue(
        self,
        db: Session,
        start_date: date,
        end_date: date
    ) -> Dict[str, Decimal]:
        """
        Get total revenue within a date range.
        
        Args:
            db: Database session
            start_date: Start date (inclusive)
            end_date: End date (inclusive)
            
        Returns:
            Dict with total revenue, tax, discount, and payment
        """
        query = select(
            func.sum(self.model.tiendt).label("total_revenue"),
            func.sum(self.model.tienthue).label("total_tax"),
            func.sum(self.model.tienck).label("total_discount"),
            func.sum(self.model.tientt).label("total_payment"),
            func.count(self.model.soct).label("invoice_count")
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
                "total_revenue": Decimal("0"),
                "total_tax": Decimal("0"),
                "total_discount": Decimal("0"),
                "total_payment": Decimal("0"),
                "invoice_count": 0
            }
            
        return row._asdict()


# Create an instance for importing
hoadon = CRUDHoaDon(HoaDon)