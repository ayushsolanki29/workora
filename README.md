# Soseki

> All-in-one business operating platform for freelancers, consultants, and small agencies.

Soseki is a modern SaaS platform built to help freelancers and small businesses manage their entire workflow from one place. Instead of juggling spreadsheets, invoice generators, project trackers, and multiple tools, Soseki provides a unified workspace to manage clients, projects, estimates, invoices, payments, and business insights.

> 🚧 Soseki is currently in active development.

---

## Vision

Build a simple, fast, and professional business operating platform that helps service-based businesses spend less time managing operations and more time delivering work.

---

## Goals

- Build a clean and intuitive user experience
- Replace multiple disconnected business tools with one platform
- Reduce manual administrative work
- Support freelancers, consultants, and small agencies
- Follow a scalable multi-tenant SaaS architecture
- Keep the codebase modular, reusable, and easy to maintain

---

## Planned MVP / Features

- **Authentication** (JWT & httpOnly Cookies)
- **Dashboard & Business Reports**
- **Client Management** (CRM)
- **Project Management**
- **Questionnaires** (Public intake forms)
- **Invoice Generator**
- **Payment Tracking & Expenses**
- **Support Tickets System**

---

## Tech Stack

This project uses an NPM Monorepo architecture containing both the frontend and backend.

### Frontend (`frontend/`)
- **Framework**: [Next.js 16](https://nextjs.org/) (React 19)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) / Base UI
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Notifications**: Sonner

### Backend (`backend/`)
- **Framework**: [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Database**: PostgreSQL
- **Security & Validation**: Helmet, CORS, bcryptjs, Joi
- **Architecture**: Controller-Service-Validation Pattern

*(Note: The project was designed with scalable infrastructure in mind, preparing for deployment via Vercel, Cloudflare, etc.)*

---

## Project Principles

- Keep it simple
- Build reusable components
- Maintain a consistent architecture
- Prefer composition over duplication
- Write clean, maintainable code
- Optimize for developer experience

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database

### 1. Clone & Install
Clone the repository and install dependencies at the root level (this will install both frontend and backend dependencies using npm workspaces):
```bash
git clone https://github.com/ayushsolanki29/soseki.git
cd soseki
npm install
```

### 2. Environment Variables

**Backend (`backend/.env`):**
Create a `.env` file inside the `backend` directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/soseki?schema=public"
JWT_SECRET="your_super_secret_jwt_key"
PORT=4000
FRONTEND_URL="http://localhost:3000"
```

**Frontend (`frontend/.env`):**
Create a `.env` file inside the `frontend` directory:
```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
```

### 3. Database Setup
Navigate to the backend and push the Prisma schema to your PostgreSQL database, then seed the initial data:
```bash
cd backend
npm run db:dev
npm run db:seed
cd ..
```

### 4. Running the App (Development)
You can run both the frontend and backend servers concurrently from the root directory using a single command:
```bash
npm run dev
```

This will start:
- Backend Express Server on `http://localhost:4000`
- Frontend Next.js Server on `http://localhost:3000`

---

## Contributing

Soseki is open source, and contributions are welcome.

Before contributing, please read the project guidelines and follow the established architecture, folder structure, and reusable component patterns.

---

## Author

**Ayush Solanki**

GitHub: https://github.com/ayushsolanki29

---

## License

MIT License
