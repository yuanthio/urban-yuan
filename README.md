# 👟 Urban Yuan — Modern E-Commerce Shoes Platform

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404d59?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge)](https://ui.shadcn.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)

**Urban Yuan** is a modern, full-stack **e-commerce web application for shoe sales** built with a scalable architecture and clean UI. The platform focuses on performance, maintainability, and a seamless shopping experience, combining a modern frontend with a robust backend system.

🌐 **Live Demo:** https://urban-yuan.vercel.app/

---

## ✨ Key Features

- **Product Catalog & Detail Pages**  
  Browse shoes with detailed product information, images, pricing, and availability.

- **Authentication & Authorization**  
  Secure user authentication powered by Supabase.

- **Admin Dashboard**  
  Manage products, stock, and images efficiently.

- **Image Upload & Optimization**  
  Product images are handled via **Cloudinary** for fast delivery and optimization.

- **Responsive & Modern UI**  
  Built with **Tailwind CSS** and **shadcn/ui** for a clean, accessible, and mobile-friendly interface.

- **Scalable Backend Architecture**  
  REST API built with **Express.js**, **PostgreSQL**, and **Prisma ORM**.

---

## 🛠️ Tech Stack

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui

### Backend
- Express.js
- Prisma ORM
- PostgreSQL
- Supabase (Auth & Database integration)

### Media & Storage
- Cloudinary (Image upload & optimization)

---

## 📂 Project Structure

    ```text
    urban-yuan/
    ├── .vscode/                    # VSCode settings & workspace configs
    ├── backend/                    # Express.js backend API
    │   ├── src/                    # Backend source code
    │   ├── prisma/                 # Prisma schema & migrations
    │   └── package.json            # Backend dependencies & scripts
    ├── frontend/                   # Next.js frontend application
    │   ├── app/                    # Next.js App Router
    │   ├── components/             # Reusable UI components
    │   ├── lib/                    # Utilities & helpers
    │   ├── styles/                 # Global & utility styles
    │   ├── public/                 # Static assets
    │   └── package.json            # Frontend dependencies & scripts
    └── README.md                   # Project overview & documentation

## 🚀 Getting Started
1. Clone Repository
   ```bash
   git clone https://github.com/yuanthio/urban-yuan.git
   cd urban-yuan
2. Install Dependencies
   ```bash
   npm install
3. Environment Variables
   ```bash
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/urban_yuan
  
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
  
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
  
   # API
   NEXT_PUBLIC_API_URL=http://localhost:4000/api
4. Database Migration
   ```bash
   npx prisma migrate dev
5. Run Development Server
   frontend & backend:
   ```bash
   npm run dev
   
## 🎯 Project Goals

Urban Yuan is built to demonstrate:

- Clean and scalable **Full-Stack Architecture**
- Proper separation of concerns between frontend and backend
- Production-ready database design using **Prisma ORM**
- Modern UI/UX with **Tailwind CSS** and **shadcn/ui**
- Secure authentication, image handling, and API integration

