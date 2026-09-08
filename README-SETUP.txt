ECORP - DUYỆT THU CHI
=====================

1) GOOGLE APPS SCRIPT
- Tạo/đặt file Code_duyetchi1.gs trong Apps Script.
- Dùng phiên bản đã chỉnh doGet/doPost trong file GAS đi kèm.
- Deploy > New deployment > Web app.
- Execute as: Me (tài khoản sở hữu Apps Script/Sheet).
- Who has access: Anyone (hoặc Anyone with Google account nếu hệ thống của bạn yêu cầu đăng nhập).
- Copy URL .../exec.

2) NETLIFY
- Upload/deploy toàn bộ thư mục này (không chỉ public/index.html).
- Vào Site configuration > Environment variables.
- Tạo:
    GAS_WEB_APP_URL = URL .../exec của Apps Script
- Redeploy site.

3) KIẾN TRÚC
Browser -> Netlify Function /.netlify/functions/api -> Apps Script -> Google Sheet/Drive

Frontend không gọi google.script.run nữa, vì frontend đã chạy độc lập trên Netlify.
Apps Script vẫn giữ quyền truy cập Spreadsheet/Drive và xử lý nghiệp vụ.

4) FILE ĐÍNH KÈM
File được đọc thành Base64 ở trình duyệt rồi gửi qua Netlify Function tới Apps Script.
Giữ nguyên logic lưu vào FOLDER_ID của Apps Script.

5) LƯU Ý
Không đặt SS_ID/FOLDER_ID ở frontend. Hai ID này chỉ nằm trong Apps Script.
