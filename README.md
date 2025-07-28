# 📦 InventoTrack

## 📝 Project Overview

**InventoTrack** is a modern full-stack inventory management system tailored for small to medium-sized businesses.  
It offers real-time stock monitoring, product categorization, transaction tracking, and visual insights—all within an intuitive UI.

Admin users can:
- Securely add, edit, or remove products and categories
- Receive low/out-of-stock alerts
- Monitor inventory with dynamic dashboards
- Manage product images via Cloudinary
- Experience secure authentication using Clerk

Built for scalability and optimized user experience, InventoTrack simplifies inventory operations efficiently.

---

## 🚀 Features

- 🔐 **User Authentication** – Seamless and secure auth using Clerk.
- 📊 **Dashboard Overview** – View total stock value, transaction counts, and product status (low/out-of-stock).
- 📁 **Category Management** – Add/edit/remove categories to group your inventory items.
- 📦 **Product Management** – Track stock, pricing, and category-wise grouping of products.
- 🌗 **Theme Support** – Light/Dark mode toggle based on user preference.
- ☁️ **Cloudinary Integration** – Upload and store product images in the cloud.
- 📈 **Transaction Monitoring** – Track recent inventory movements and trends.

---

## 🛠️ Tech Stack

- **⚛️ [Next.js](https://nextjs.org)** – A powerful **React framework** enabling **server-side rendering** and **full-stack capabilities**.
- **🟦 [TypeScript](https://www.typescriptlang.org)** – Adds **static type checking** to JavaScript, ensuring safer and cleaner code.
- **🧬 [Prisma](https://www.prisma.io)** – Modern **ORM** for type-safe database access and schema migrations.
- **🐘 [PostgreSQL](https://www.postgresql.org)** – Robust and scalable **relational database** used for storing app data.
- **🎨 [Tailwind CSS](https://tailwindcss.com)** – A **utility-first CSS framework** for fast, responsive, and maintainable UI design.
- **🔐 [Clerk](https://clerk.dev)** – Provides **authentication, session management**, and **RBAC (role-based access control)**.
- **🌤️ [Cloudinary](https://cloudinary.com)** – Cloud-based **image storage**, transformation, and optimization.
- **🚀 [Vercel](https://vercel.com)** – Cloud platform for **hosting**, **CI/CD**, and **global deployments** with ease.


---

---

## ⚙️ Environment Setup

Create a `.env` file in the root and configure:

```env
# Prisma Database URL (PostgreSQL via Accelerate)
DATABASE_URL="prisma+postgres://accelerate.p"

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=RB

# Cloudinary Upload Preset
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=F
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=ddjfu17wo

# Clerk Authentication (User Auth)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Clerk Auth Routing (Frontend Routes)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```
---

---

## 🚀 Getting Started

### 📦 Installation
bash here getting satrted is comming after  next public url sperete this to sections

```bash
# Clone the repository
git clone https://github.com/yourusername/invento-track.git
```

```bash
# Move into the project directory
cd invento-track
```

```bash
# Install dependencies
npm install
```

```bash
# Set up Prisma
npx prisma generate
npx prisma migrate dev --name init
```

```bash
# Start the development server
npm run dev
