# Hướng dẫn thiết lập cơ sở dữ liệu Supabase

## Thiết lập bảng user_profile và trigger

Sau khi tạo dự án Supabase, bạn cần chạy các file SQL sau theo thứ tự:

1. Đầu tiên, tạo bảng `user_profile`:
   - Mở SQL Editor trong Dashboard Supabase
   - Chạy nội dung trong file `user_profile.sql`

2. Sau đó, thiết lập trigger để tự động tạo profile khi người dùng đăng ký:
   - Chạy nội dung trong file `user_profile_trigger.sql`

## Cách chạy SQL trong Supabase

1. Đăng nhập vào [Supabase Dashboard](https://app.supabase.io)
2. Chọn dự án của bạn
3. Vào mục **SQL Editor** ở thanh bên trái
4. Tạo query mới và dán nội dung SQL vào
5. Nhấn nút "Run" để thực thi

## Kiểm tra

Sau khi thiết lập, khi người dùng đăng ký mới, một bản ghi sẽ tự động được tạo trong bảng `user_profile` với ID giống với ID của họ trong `auth.users`, các trường còn lại sẽ là NULL để cập nhật sau.

Bạn có thể kiểm tra bằng cách:
1. Tạo tài khoản người dùng mới
2. Chạy truy vấn: `SELECT * FROM public.user_profile;` 
3. Bạn sẽ thấy một bản ghi mới với ID trùng với ID người dùng vừa tạo 