import requests
import json

def tao_khach_hang(token):
    # URL của API
    url = "http://localhost:8000/api/v1/khachhang"
    
    # Dữ liệu khách hàng cần gửi
    data = {
        "tenkh": "Công ty TNHH ABC",
        "diachi": "123 Đường XYZ, Quận 1, TP.HCM",
        "sdt": "0901234567",
        "email": "contact@abc.com",
        "masothue": "123",
        "phanloai": "Doanh nghiệp"
    }
    
    # Header với Bearer token
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Gửi request POST
    response = requests.post(url, headers=headers, data=json.dumps(data))
    
    # Kiểm tra kết quả
    if response.status_code == 200 or response.status_code == 201:
        print("Tạo khách hàng thành công!")
        print("Phản hồi:", response.json())
    else:
        print(f"Lỗi: {response.status_code}")
        print("Nội dung lỗi:", response.text)

# Sử dụng hàm
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJleHAiOjE3NDUzODI1OTZ9.n0cj9GG24raibnFAiNsVxPgVFTskbp6qTlK2osSJEsc"  # Thay thế bằng token thực của bạn
tao_khach_hang(token)