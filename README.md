# LedgerVault

**LedgerVault** is an immutable, real-time banking ledger application designed to guarantee financial data integrity. Built with modern web technologies, it features dedicated portals for Tellers and Auditors, ensuring secure, append-only transactions with strict Row-Level Security (RLS) enforcement.

---

## Key Features

- **Immutable Ledger System**: Transactions (`ledger_event`) are strictly append-only. The database prevents any `UPDATE` or `DELETE` operations on historical records.
- **Role-Based Portals**:
  - **Teller Portal**: Facilitates everyday transactional entries, complete with shift history tracking.
  - **Auditor Portal**: Equips auditors to monitor risk alerts and perform documented, traceable compensating transactions (reversals) rather than mutating historical data.
- **Real-Time Data**: Instant synchronization across clients using Supabase Realtime subscriptions.
- **Strict Row-Level Security (RLS)**: Fine-grained access control managed directly at the database tier in PostgreSQL.
- **Modern Tech Stack**: React 19, Tailwind CSS v4, Vite, and robust client-side validation using Zod and React Hook Form.

## Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4, Lucide React (Icons), clsx & tailwind-merge
- **Routing**: React Router DOM v7
- **Forms & Validation**: React Hook Form + Zod
- **Backend Service**: Supabase JS Client

### Backend (Supabase / PostgreSQL)
- **Database**: PostgreSQL
- **Security**: Strict Row-Level Security (RLS)
- **Features**: UUIDs for entities, Real-time WebSockets publication

## Project Structure

```text
ledgervault/
├── backend_schema.sql  # Complete DB schema, RLS policies, and tables
├── seed_data.sql       # Initial seed data for quick testing
├── frontend/           # The complete React web application
│   ├── src/
│   │   ├── components/ # Reusable UI elements (e.g., LedgerActionPanel)
│   │   ├── pages/      # Route components (Teller, Auditor portals)
│   │   └── utils/      # Helpers (e.g., tailwind `cn` utility)
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Supabase Account](https://supabase.com/)

### 1. Database Setup

1. Create a new project in Supabase.
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Run the contents of `backend_schema.sql` to establish the tables, RLS policies, and Realtime publications.
4. (Optional) Run the contents of `seed_data.sql` to populate sample accounts and data.

### 2. Frontend Setup

Navigate into the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

### 3. Environment Variables

Create a `.env` file in the `frontend/` directory and configure your Supabase connection:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server

Start the Vite development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Architecture & Security Principles

LedgerVault adheres to strict financial software principles:

1. **No Mutations**: Once a `ledger_event` is recorded, it cannot be modified or deleted. 
2. **Traceable Reversals**: Mistakes must be corrected using a `compensating_transaction`. This ensures an unbroken audit trail.
3. **Defense in Depth**: Database constraints and RLS prevent bad data from ever persisting, acting as the final line of defense against compromised clients.
