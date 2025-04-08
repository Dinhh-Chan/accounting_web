Danh sách API
Xác thực & Người dùng
CopyPOST /api/v1/auth/register - Đăng ký người dùng mới
POST /api/v1/auth/login - Đăng nhập và lấy token

GET /api/v1/users/me - Lấy thông tin người dùng hiện tại
PUT /api/v1/users/me - Cập nhật thông tin người dùng hiện tại
GET /api/v1/users - Lấy danh sách người dùng
GET /api/v1/users/status - Lấy danh sách người dùng theo trạng thái
GET /api/v1/users/active - Lấy danh sách người dùng đang hoạt động
GET /api/v1/users/login-history - Lấy danh sách người dùng theo thời gian đăng nhập
GET /api/v1/users/phone/{phone_number} - Tìm kiếm người dùng theo số điện thoại
GET /api/v1/users/{user_id} - Lấy thông tin người dùng theo ID
PUT /api/v1/users/{user_id} - Cập nhật thông tin người dùng
PATCH /api/v1/users/{user_id}/status - Cập nhật trạng thái người dùng
DELETE /api/v1/users/{user_id} - Xóa người dùng
POST /api/v1/users/bulk-deactivate - Vô hiệu hóa nhiều người dùng cùng lúc
Khách hàng (Khachhang)
CopyGET /api/v1/khachhang - Lấy danh sách khách hàng
POST /api/v1/khachhang - Tạo khách hàng mới
GET /api/v1/khachhang/search - Tìm kiếm khách hàng theo từ khóa
GET /api/v1/khachhang/{ma_kh} - Lấy thông tin khách hàng theo mã
GET /api/v1/khachhang/masothue/{ma_so_thue} - Lấy thông tin khách hàng theo mã số thuế
PUT /api/v1/khachhang/{ma_kh} - Cập nhật thông tin khách hàng
DELETE /api/v1/khachhang/{ma_kh} - Xóa khách hàng
GET /api/v1/khachhang/check/ma-kh/{ma_kh} - Kiểm tra mã khách hàng đã tồn tại chưa
GET /api/v1/khachhang/check/ma-so-thue/{ma_so_thue} - Kiểm tra mã số thuế đã tồn tại chưa
GET /api/v1/khachhang/next/ma-kh - Lấy mã khách hàng tiếp theo
Sản phẩm dịch vụ (SPDV)
CopyGET /api/v1/spdv - Lấy danh sách sản phẩm dịch vụ
POST /api/v1/spdv - Tạo sản phẩm dịch vụ mới
GET /api/v1/spdv/search - Tìm kiếm sản phẩm dịch vụ theo từ khóa
GET /api/v1/spdv/{ma_spdv} - Lấy thông tin sản phẩm dịch vụ theo mã
PUT /api/v1/spdv/{ma_spdv} - Cập nhật thông tin sản phẩm dịch vụ
DELETE /api/v1/spdv/{ma_spdv} - Xóa sản phẩm dịch vụ
GET /api/v1/spdv/next-id - Lấy mã sản phẩm dịch vụ tiếp theo
GET /api/v1/spdv/check/{ma_spdv} - Kiểm tra mã sản phẩm dịch vụ đã tồn tại chưa
Bảng giá (Banggia)
CopyGET /api/v1/banggia - Lấy danh sách bảng giá
POST /api/v1/banggia - Tạo giá mới cho sản phẩm
GET /api/v1/banggia/product/{ma_spdv} - Lấy lịch sử giá của một sản phẩm
GET /api/v1/banggia/latest/{ma_spdv} - Lấy giá mới nhất của sản phẩm
GET /api/v1/banggia/{ma_spdv}/{ngay_hl} - Lấy giá của sản phẩm theo ngày hiệu lực cụ thể
PUT /api/v1/banggia/{ma_spdv}/{ngay_hl} - Cập nhật thông tin giá
DELETE /api/v1/banggia/{ma_spdv}/{ngay_hl} - Xóa thông tin giá
Định mức chiết khấu (Dinhmucck)
CopyGET /api/v1/dinhmucck - Lấy danh sách định mức chiết khấu
POST /api/v1/dinhmucck - Tạo định mức chiết khấu mới cho sản phẩm
GET /api/v1/dinhmucck/product/{ma_spdv} - Lấy lịch sử định mức chiết khấu của một sản phẩm
GET /api/v1/dinhmucck/latest/{ma_spdv} - Lấy định mức chiết khấu áp dụng cho một sản phẩm
GET /api/v1/dinhmucck/{ma_spdv}/{ngay_hl} - Lấy định mức chiết khấu của sản phẩm theo ngày hiệu lực cụ thể
PUT /api/v1/dinhmucck/{ma_spdv}/{ngay_hl} - Cập nhật thông tin định mức chiết khấu
DELETE /api/v1/dinhmucck/{ma_spdv}/{ngay_hl} - Xóa thông tin định mức chiết khấu
Hóa đơn (Hoadon)
CopyGET /api/v1/hoadon - Lấy danh sách hóa đơn
POST /api/v1/hoadon - Tạo hóa đơn mới
GET /api/v1/hoadon/by-date-range - Lấy danh sách hóa đơn theo khoảng thời gian
GET /api/v1/hoadon/by-customer/{ma_kh} - Lấy danh sách hóa đơn của một khách hàng
GET /api/v1/hoadon/{so_ct} - Lấy thông tin chi tiết của một hóa đơn
GET /api/v1/hoadon/revenue-by-customer - Lấy thống kê doanh thu theo từng khách hàng
GET /api/v1/hoadon/revenue-by-product - Lấy thống kê doanh thu theo từng sản phẩm
GET /api/v1/hoadon/revenue-by-month/{year} - Lấy thống kê doanh thu theo từng tháng trong năm
GET /api/v1/hoadon/total-revenue - Lấy tổng doanh thu trong khoảng thời gian
Chi tiết hóa đơn (CTHoadon)
CopyGET /api/v1/cthoadon/invoice/{so_ct} - Lấy tất cả chi tiết của một hóa đơn
GET /api/v1/cthoadon/{so_ct}/{ma_spdv} - Lấy chi tiết của một hóa đơn theo mã sản phẩm
POST /api/v1/cthoadon - Tạo chi tiết hóa đơn mới
PUT /api/v1/cthoadon/{so_ct}/{ma_spdv} - Cập nhật chi tiết hóa đơn
DELETE /api/v1/cthoadon/{so_ct}/{ma_spdv} - Xóa chi tiết hóa đơn
DELETE /api/v1/cthoadon/invoice/{so_ct} - Xóa tất cả chi tiết của một hóa đơn
GET /api/v1/cthoadon/statistics/frequency - Lấy danh sách sản phẩm bán thường xuyên nhất
GET /api/v1/cthoadon/statistics/revenue - Lấy danh sách sản phẩm có doanh thu cao nhất
Phiếu giảm giá (Phieugiamgia)
CopyGET /api/v1/phieugiamgia - Lấy danh sách phiếu giảm giá
POST /api/v1/phieugiamgia - Tạo phiếu giảm giá mới
GET /api/v1/phieugiamgia/by-date-range - Lấy danh sách phiếu giảm giá theo khoảng thời gian
GET /api/v1/phieugiamgia/by-customer/{ma_kh} - Lấy danh sách phiếu giảm giá của một khách hàng
GET /api/v1/phieugiamgia/by-invoice/{so_ct} - Lấy danh sách phiếu giảm giá của một hóa đơn
GET /api/v1/phieugiamgia/{so_phieu} - Lấy thông tin chi tiết của một phiếu giảm giá
PUT /api/v1/phieugiamgia/{so_phieu} - Cập nhật thông tin phiếu giảm giá
DELETE /api/v1/phieugiamgia/{so_phieu} - Xóa phiếu giảm giá
GET /api/v1/phieugiamgia/statistics/by-customer - Lấy thống kê giảm giá theo từng khách hàng
GET /api/v1/phieugiamgia/statistics/by-product - Lấy thống kê giảm giá theo từng sản phẩm
GET /api/v1/phieugiamgia/statistics/total - Lấy tổng giảm giá trong khoảng thời gian
GET /api/v1/phieugiamgia/next-id - Lấy số phiếu giảm giá tiếp theo
Chi tiết phiếu giảm giá (CTPhieu)
CopyGET /api/v1/ctphieu/voucher/{so_phieu} - Lấy tất cả chi tiết của một phiếu giảm giá
GET /api/v1/ctphieu/{so_phieu}/{ma_spdv} - Lấy chi tiết của một phiếu giảm giá theo mã sản phẩm
POST /api/v1/ctphieu - Tạo chi tiết phiếu giảm giá mới
PUT /api/v1/ctphieu/{so_phieu}/{ma_spdv} - Cập nhật chi tiết phiếu giảm giá
DELETE /api/v1/ctphieu/{so_phieu}/{ma_spdv} - Xóa chi tiết phiếu giảm giá
DELETE /api/v1/ctphieu/voucher/{so_phieu} - Xóa tất cả chi tiết của một phiếu giảm giá
GET /api/v1/ctphieu/statistics/frequency - Lấy danh sách sản phẩm được giảm giá nhiều nhất
GET /api/v1/ctphieu/statistics/amount - Lấy danh sách sản phẩm có giá trị giảm giá cao nhất
Tài khoản kế toán (TKKT)
CopyGET /api/v1/tkkt - Lấy danh sách tài khoản kế toán
POST /api/v1/tkkt - Tạo tài khoản kế toán mới
GET /api/v1/tkkt/search - Tìm kiếm tài khoản kế toán theo từ khóa
GET /api/v1/tkkt/level/{cap_tk} - Lấy danh sách tài khoản kế toán theo cấp
GET /api/v1/tkkt/{ma_tk} - Lấy thông tin tài khoản kế toán theo mã
PUT /api/v1/tkkt/{ma_tk} - Cập nhật thông tin tài khoản kế toán
DELETE /api/v1/tkkt/{ma_tk} - Xóa tài khoản kế toán
GET /api/v1/tkkt/check/{ma_tk} - Kiểm tra mã tài khoản kế toán đã tồn tại chưa
Bạn có thể chèn nội dung này vào file README.md của dự án để làm tài liệu tham khảo cho các API hiện có.