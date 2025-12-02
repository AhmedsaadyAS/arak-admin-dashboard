# Arak Admin Dashboard 🎓

A modern, feature-rich web admin panel for the **Arak School Management System** — designed to streamline school-parent interactions through attendance tracking, grade management, scheduling, fee processing, and real-time communication.

![React](https://img.shields.io/badge/React-18.3.1-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.4.11-646CFF?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📋 Overview

Arak Admin Dashboard is a comprehensive school administration platform that enables administrators to manage students, teachers, events, fees, and parent communications from a single, intuitive interface. Built with React and Vite for optimal performance, the application currently uses mock data while a full-stack backend integration is planned.

### ✨ Key Features

- **📊 Dashboard** — Real-time statistics and charts for student performance, attendance trends, and financial summaries
- **👨‍🎓 Student Management** — Comprehensive student profiles with grades, attendance, parent information, and enrollment history
- **👩‍🏫 Teacher Management** — Teacher profiles, subject assignments, experience tracking, and professional details
- **📅 Events Calendar** — Manage school events including classes, meetings, field trips, and parties
- **💰 Fees & Invoices** — Invoice generation, payment tracking, and financial reporting with status filters
- **💬 Chat System** — Real-time messaging between administrators, teachers, and parents
- **📈 Activity Feed** — Centralized activity log with AI-powered insights for student risk assessment
- **👥 User & Role Management** — Advanced user administration with role-based permissions for admin and parent users
- **🤖 AI Insights** — Simple AI risk analysis for student performance and behavior patterns

---

## 🛠️ Tech Stack

- **Frontend Framework:** React 18.3.1
- **Build Tool:** Vite 5.4.11
- **UI Library:** Lucide React (icons)
- **Charts:** Recharts 3.5.1
- **Styling:** Vanilla CSS with custom design system
- **Data:** Mock data (planned backend: ASP.NET Core + SQL Server)

---

## 📁 Project Structure

```
arak-admin/
├── public/                  # Static assets
├── src/
│   ├── components/
│   │   ├── layout/         # Sidebar, Topbar
│   │   └── ui/             # Modal, reusable components
│   ├── pages/
│   │   ├── Dashboard/      # Main dashboard
│   │   ├── Students/       # Student list & details
│   │   ├── Teachers/       # Teacher list & details
│   │   ├── Events/         # Calendar view
│   │   ├── Fees/           # Invoice management
│   │   ├── Chat/           # Messaging interface
│   │   ├── Activity/       # AI insights & activity log
│   │   ├── User/           # User & role management
│   │   └── Settings/       # App settings
│   ├── mock/               # Mock data (students, teachers, fees, etc.)
│   ├── styles/             # Global CSS and layout styles
│   ├── App.jsx             # Main app component
│   └── main.jsx            # Entry point
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AhmedsaadyAS/arak-admin-dashboard.git
   cd arak-admin-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   Navigate to http://localhost:5173
   ```

### Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

---

## 🎯 Future Enhancements

- **Backend Integration** — ASP.NET Core API with SQL Server database
- **Authentication & Authorization** — JWT-based authentication with role-based access control
- **Real-time Features** — WebSocket integration for live chat and notifications
- **Advanced AI** — Machine learning models for predictive analytics and student risk assessment
- **Mobile App** — React Native companion app for parents
- **Deployment** — Cloud deployment on Azure/AWS with CI/CD pipeline
- **Localization** — Multi-language support (English, Arabic)
- **Export Features** — PDF/Excel export for reports and invoices

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
