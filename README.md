# Arak Admin Dashboard 🎓

A modern, feature-rich web admin panel for the **Arak School Management System** — designed to streamline school-parent interactions through attendance tracking, grade management, scheduling, fee processing, and real-time communication.

![React](https://img.shields.io/badge/React-18.3.1-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.4.11-646CFF?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📋 Overview

Arak Admin Dashboard is a comprehensive school administration platform that enables administrators to manage students, teachers, events, fees, and parent communications from a single, intuitive interface. 

**Latest Update (v2.0):** The project now features a fully functional **Mock API** using `json-server` and a robust **Service Layer** architecture, simulating a real production backend with full CRUD capabilities, server-side search, and latency simulation.

### ✨ Key Features

- **📊 Dashboard** — Real-time statistics and charts for student performance, attendance trends, and financial summaries
- **👨‍🎓 Student Management** — Full CRUD operations, dynamic profiles, grade management, and parent info
- **👩‍🏫 Teacher Management** — Teacher profiles, class assignments, and schedule tracking
- **📅 Events & Schedule** — Calendar management for school events and class schedules
- **💰 Fees Management** — Tracking invoices and payment status
- **🔍 Advanced Search** — Server-side search and filtering for students and teachers
- **🤖 AI Insights** — Simulated AI analysis for student risk assessment

---

## 🛠️ Tech Stack

- **Frontend Framework:** React 18.3.1
- **Build Tool:** Vite 5.4.11
- **Mock Backend:** JSON Server (Simulation of REST API)
- **Routing:** React Router v6
- **UI Library:** Lucide React (icons)
- **Charts:** Recharts 3.5.1
- **Styling:** Vanilla CSS with scoped modules

---

## 📁 Project Structure

```
arak-admin/
├── public/                  # Static assets
├── src/
│   ├── components/
│   │   ├── layout/         # Sidebar, Topbar
│   │   └── ui/             # Reusable UI components
│   ├── pages/
│   │   ├── Dashboard/      # Main dashboard
│   │   ├── Students/       # List & Details (API integrated)
│   │   ├── Teachers/       # List & Details (API integrated)
│   │   └── ...             # Other modules
│   ├── services/
│   │   └── api.js          # Centralized Service Layer (Fetch Wrapper)
│   ├── context/            # Global state (RefreshContext)
│   ├── mock/               # Legacy static mock data (transitioning to API)
│   └── styles/             # Global CSS
├── db.json                 # Mock Database (JSON Server)
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/AhmedsaadyAS/arak-admin-dashboard.git
   cd arak-admin-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the Mock Server** (Required for data)
   Open a new terminal and run:
   ```bash
   npm run server
   ```
   *Runs on http://localhost:5000*

4. **Start the Development App**
   Open a second terminal and run:
   ```bash
   npm run dev
   ```
   *Runs on http://localhost:5173*

5. **Open your browser**
   Navigate to `http://localhost:5173`

> [!NOTE]
> You must run **BOTH** the server and the dev command for the application to function correctly.

### Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` folder.

---

## 🎯 Future Enhancements

- **Real Backend Integration** — Replace `api.js` endpoints with real ASP.NET Core API
- **Authentication** — Login/Signup screens with JWT
- **Advanced Reporting** — Export to PDF/Excel
- **Cloud Deployment** — CI/CD pipelines

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Ahmed Saady**

- GitHub: [@AhmedsaadyAS](https://github.com/AhmedsaadyAS)

---

## 🙏 Acknowledgments

- Design inspiration from modern admin dashboards
- Icons by [Lucide Icons](https://lucide.dev/)
- Charts powered by [Recharts](https://recharts.org/)

---

**Note:** This is currently a frontend-only MVP using mock data. Backend integration is planned for future releases.
