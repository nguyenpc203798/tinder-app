# 💕 AI Matching System

> **Smart dating application using AI to match users based on compatibility and geographical location**

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-green?style=flat&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Gemini_AI-orange?style=flat&logo=google" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css" alt="Tailwind CSS" />
</p>

## 🚀 Project Overview

**AI Matching System** is a modern dating application that uses artificial intelligence to find compatible matches. Unlike traditional dating apps, our system features:

- 🤖 **AI-Powered Matching**: Uses Gemini AI to analyze compatibility
- 📍 **Location-Based Priority**: Prioritizes users in the same geographical area  
- 🎯 **Smart Ranking**: Ranks top 50 candidates instead of random selection
- ⚡ **Real-time Notifications**: Instant notifications for new matches
- 🔐 **Secure Authentication**: Safe login with email and Google

## 🛠️ Tech Stack

| Technology | Purpose | Version |
|-----------|----------|---------|
| **Next.js** | Frontend Framework | 14.x |
| **TypeScript** | Type Safety | 5.x |
| **Supabase** | Backend-as-a-Service | Latest |
| **Gemini AI** | AI Matching Algorithm | Latest |
| **Tailwind CSS** | UI Styling | 3.x |
| **Lucide React** | Icons | Latest |

## ✨ Current Features

### ✅ **Completed**
- 🔐 **Authentication System**
  - Email registration/login
  - Google OAuth login
  - Email password reset
  - Protected routes & middleware

- 👤 **Profile Management**  
  - Complete profile creation and editing
  - Multiple photo uploads
  - Preference settings (age, distance, interests)
  - Location-based settings

- 🤖 **AI Matching Engine**
  - Smart 50-user selection algorithm
  - Location-first priority matching
  - Gemini AI compatibility scoring
  - Dynamic re-ranking system

- 💕 **Matching Interface**
  - Tinder-like card UI
  - Like/Pass actions
  - Match detection & notifications
  - Priority-based user queue

- 🔔 **Real-time Notifications**
  - Push notifications for likes
  - Instant match notifications
  - Activity status updates

### 🚧 **In Development**
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

## 📦 Installation and Setup

### **Step 1: Clone Repository**
```bash
git clone https://github.com/nguyenpc203798/tinder-app.git
cd tinder-app
```

### **Step 2: Install Dependencies**
```bash
# Using npm
npm install

# Or using yarn
yarn install

# Or using pnpm
pnpm install
```

### **Step 3: Configure Environment Variables**
Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://uhqulnbkkfrsxkgxeipi.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVocXVsbmJra2Zyc3hrZ3hlaXBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNDA2NjAsImV4cCI6MjA2ODkxNjY2MH0.G7i1p3UmdlxKhXeoO-ICpwK1skMojQxC7LipXrQOZeg
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVocXVsbmJra2Zyc3hrZ3hlaXBpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzM0MDY2MCwiZXhwIjoyMDY4OTE2NjYwfQ.3WyVurCK7uSNtXzZkrZYhI64Ta5oXJuEiUna2sMQPrE

# Gemini AI Configuration  
GEMINI_API_KEY=AIzaSyCHAhfVuNStd8RokFFJ3mkCEOhUioGD73E
```

### **Step 4: Run Development Server**
```bash
npm run dev
# or
yarn dev  
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🗂️ Project Structure

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

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Run development server
npm run build        # Build for production
npm run start        # Run production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## 📊 Database Schema

### **Main Tables:**
- `user_profile` - Detailed user information
- `matches` - Matched pairs
- `likes` - Like data storage
- `notifications` - Notifications for likes, matches, and alerts
- `messages` - Chat messages (coming soon)

## 🤖 AI Matching Algorithm

### **Matching Process:**

1. **User Selection** (50 users max)
   - Prioritize same location (30 users)
   - Distance-based selection (20 users)
   - Random fallback if insufficient

2. **AI Compatibility Scoring**
   ```javascript
   const scoringCriteria = {
     location_bonus: 30%,      // Same area
     interest_overlap: 25%,    // Common interests  
     age_compatibility: 15%,   // Age compatibility
     lifestyle_match: 15%,     // Similar lifestyle
     education_level: 10%,     // Education level
     personality_traits: 5%    # Personality traits
   }
   ```

## 🚀 Deployment

### **Vercel (Recommended)**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add GEMINI_API_KEY
# ... add all env vars
```

### **Coding Standards:**
- ✅ TypeScript strict mode
- ✅ ESLint + Prettier formatting
- ✅ Component-driven development
- ✅ Mobile-first responsive design
- ✅ Comprehensive documentation

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

## 📞 Support

- 📧 **Email**: nguyenpc203@gmail.com

<div align="center">

**Made with ❤️ by Phuong Cong Nguyen**

[⭐ Star this repo](https://github.com/yourusername/ai-matching-system) • [🍴 Fork](https://github.com/yourusername/ai-matching-system/fork) • [📊 Issues](https://github.com/yourusername/ai-matching-system/issues)

</div>