from fastapi import APIRouter

from app.api.v1.endpoints import users, auth, hoadon, khachhang,banggia, ct_hoadon , ct_phieu, dinhmucck,phieugiamgia,spdv,tkkt

api_router = APIRouter()

# Include all API endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(hoadon.router, prefix="/hoadon", tags=["hoadon"])
api_router.include_router(khachhang.router, prefix="/khachhang", tags= ["khachhang"])
api_router.include_router(banggia.router, prefix="/banggia", tags= ["banggia"])
api_router.include_router(ct_hoadon.router, prefix="/ct_hoadon", tags= ["ct_hoadon"])
api_router.include_router(ct_phieu.router, prefix="/ct_phieu", tags= ["ct_phieu"])
api_router.include_router(dinhmucck.router, prefix="/dinhmucck", tags= ["dinhmucck"])
api_router.include_router(phieugiamgia.router, prefix="/phieugiamgia", tags= ["phieugiamgia"])
api_router.include_router(spdv.router, prefix="/spdv", tags= ["spdv"])

api_router.include_router(tkkt.router, prefix="/tkkt", tags= ["tkkt"])




