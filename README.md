# 💕 AI Matching System

> **Ứng dụng hẹn hò thông minh sử dụng AI để ghép đôi người dùng dựa trên độ tương thích và vị trí địa lý**

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-green?style=flat&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Gemini_AI-orange?style=flat&logo=google" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css" alt="Tailwind CSS" />
</p>

## 🚀 Giới Thiệu Dự Án

**AI Matching System** là ứng dụng hẹn hò hiện đại sử dụng trí tuệ nhân tạo để tìm kiếm người phù hợp. Khác với các ứng dụng hẹn hò truyền thống, hệ thống của chúng tôi:

- 🤖 **AI-Powered Matching**: Sử dụng Gemini AI để phân tích độ tương thích
- 📍 **Location-Based Priority**: Ưu tiên người dùng cùng khu vực địa lý  
- 🎯 **Smart Ranking**: Xếp hạng 50 ứng viên tốt nhất thay vì random
- ⚡ **Real-time Notifications**: Thông báo tức thời khi có match mới
- 🔐 **Secure Authentication**: Đăng nhập an toàn với email và Google

## 🛠️ Công Nghệ Sử Dụng

| Công nghệ | Mục đích | Version |
|-----------|----------|---------|
| **Next.js** | Frontend Framework | 14.x |
| **TypeScript** | Type Safety | 5.x |
| **Supabase** | Backend-as-a-Service | Latest |
| **Gemini AI** | AI Matching Algorithm | Latest |
| **Tailwind CSS** | UI Styling | 3.x |
| **Lucide React** | Icons | Latest |

## ✨ Tính Năng Hiện Tại

### ✅ **Đã Hoàn Thành**
- 🔐 **Authentication System**
  - Đăng ký/Đăng nhập bằng Email
  - Đăng nhập bằng Google OAuth
  - Reset password qua email
  - Protected routes & middleware

- 👤 **Profile Management**  
  - Tạo và chỉnh sửa profile đầy đủ
  - Upload multiple photos
  - Cài đặt preferences (tuổi, khoảng cách, sở thích)
  - Location-based settings

- 🤖 **AI Matching Engine**
  - Smart 50-user selection algorithm
  - Location-first priority matching
  - Gemini AI compatibility scoring
  - Dynamic re-ranking system

- 💕 **Matching Interface**
  - Card-based UI giống Tinder
  - Like/Pass actions
  - Match detection & notifications
  - Priority-based user queue

- 🔔 **Real-time Notifications**
  - Push notifications khi có người like
  - Instant match notifications
  - Activity status updates

### 🚧 **Đang Phát Triển**
- 💬 **Chat System** (Coming Soon)
  - Real-time messaging
  - Media sharing (photos, voice notes)
  - Message encryption
  - Chat history & search

- 📞 **Voice & Video Calls** (Planned)
  - In-app voice calls
  - Video chat integration
  - Call history & recordings
  - Screen sharing

- 🎁 **Premium Features** (Future)
  - Super likes & boosts
  - See who liked you
  - Advanced filters
  - Read receipts

## 📦 Cài Đặt và Chạy Dự Án

### **Bước 1: Clone Repository**
```bash
git clone https://github.com/nguyenpc203798/tinder-app.git
cd tinder-app
```

### **Bước 2: Cài Đặt Dependencies**
```bash
# Sử dụng npm
npm install

# Hoặc sử dụng yarn
yarn install

# Hoặc sử dụng pnpm
pnpm install
```

### **Bước 3: Cấu Hình Environment Variables**
Tạo file `.env.local` trong thư mục root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://uhqulnbkkfrsxkgxeipi.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVocXVsbmJra2Zyc3hrZ3hlaXBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNDA2NjAsImV4cCI6MjA2ODkxNjY2MH0.G7i1p3UmdlxKhXeoO-ICpwK1skMojQxC7LipXrQOZeg
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVocXVsbmJra2Zyc3hrZ3hlaXBpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzM0MDY2MCwiZXhwIjoyMDY4OTE2NjYwfQ.3WyVurCK7uSNtXzZkrZYhI64Ta5oXJuEiUna2sMQPrE

# Gemini AI Configuration  
GEMINI_API_KEY=AIzaSyCHAhfVuNStd8RokFFJ3mkCEOhUioGD73E

```

### **Bước 4: Chạy Development Server**
```bash
npm run dev
# hoặc
yarn dev  
# hoặc
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## 🗂️ Cấu Trúc Thư Mục

```
ai-matching-system/
├── 📁 src/
│   ├── 📁 app/                    # Next.js App Router
│   │   ├── 📁 (auth)/            # Authentication pages
│   │   │   ├── 📁 login/
│   │   │   └── 📁 register/
│   │   ├── 📁 (dashboard)/       # Main app pages  
│   │   │   ├── 📁 profile/
│   │   │   ├── 📁 matching/
│   │   │   └── 📁 chat/
│   │   ├── 📁 api/               # API routes
│   │   │   ├── 📁 auth/
│   │   │   ├── 📁 profiles/
│   │   │   ├── 📁 ranking/
│   │   │   └── 📁 matches/
│   │   └── 📄 layout.tsx
│   ├── 📁 components/            # Reusable components
│   │   ├── 📁 ui/               # Base UI components
│   │   ├── 📁 auth/             # Auth-related components  
│   │   ├── 📁 profile/          # Profile components
│   │   └── 📁 matching/         # Matching interface
│   ├── 📁 lib/                  # Utilities & configs
│   │   ├── 📁 supabase/         # Supabase client & helpers
│   │   ├── 📁 gemini/           # AI integration
│   │   └── 📁 utils/            # Helper functions
│   ├── 📁 types/                # TypeScript type definitions
│   └── 📁 hooks/                # Custom React hooks
├── 📁 database/                 # Database schemas & migrations
├── 📁 public/                   # Static assets
├── 📄 package.json
├── 📄 tailwind.config.js
└── 📄 README.md
```

## 🔧 Scripts Có Sẵn

```bash
# Development
npm run dev          # Chạy development server
npm run build        # Build production
npm run start        # Chạy production server
npm run lint         # Chạy ESLint
npm run type-check   # Kiểm tra TypeScript

## 📊 Database Schema

### **Bảng Chính:**
- `user_profile` - Thông tin người dùng chi tiết
- `matches` - Các cặp đôi đã match
- `likes` - Lưu trữ dữ liệu like
- `notificatons` - Lưu trữ thông báo khi có like, match và thông báo
- `messages` - Tin nhắn chat (coming soon)

## 🤖 AI Matching Algorithm

### **Quy Trình Matching:**

1. **User Selection** (50 users max)
   - Ưu tiên cùng location (30 users)
   - Distance-based selection (20 users)
   - Random fallback nếu thiếu

2. **AI Compatibility Scoring**
   ```javascript
   const scoringCriteria = {
     location_bonus: 30%,      // Cùng khu vực
     interest_overlap: 25%,    // Sở thích chung  
     age_compatibility: 15%,   // Độ tuổi phù hợp
     lifestyle_match: 15%,     // Lối sống tương đồng
     education_level: 10%,     // Trình độ học vấn
     personality_traits: 5%    // Tính cách
   }
   ```

## 🚀 Deployment

### **Vercel (Recommended)**
```bash
# Cài đặt Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add GEMINI_API_KEY
# ... thêm tất cả env vars
```


### **Coding Standards:**
- ✅ TypeScript strict mode
- ✅ ESLint + Prettier formatting
- ✅ Component-driven development
- ✅ Mobile-first responsive design
- ✅ Comments bằng tiếng Việt

## 📝 Changelog

### **v1.0.0** (Current)
- ✅ Basic authentication system
- ✅ Profile management
- ✅ AI matching algorithm  
- ✅ Location-based filtering
- ✅ Real-time notifications

### **v1.1.0** (Next Release)
- 🚧 Chat system implementation
- 🚧 Media sharing in chat
- 🚧 Advanced notification settings

### **v2.0.0** (Future)
- 📞 Voice & video calls
- 🎁 Premium features
- 🌍 Multi-language support

## 📞 Hỗ Trợ

- 📧 **Email**: nguyenpc203@gmail.com

<div align="center">

**Made with ❤️ by Phuong Cong Nguyen**

[⭐ Star this repo](https://github.com/yourusername/ai-matching-system) • [🍴 Fork](https://github.com/yourusername/ai-matching-system/fork) • [📊 Issues](https://github.com/yourusername/ai-matching-system/issues)

</div>