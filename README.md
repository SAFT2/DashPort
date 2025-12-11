# 📊 Full Stack Admin Dashboard

A production-ready admin dashboard with user management, product management, analytics, and activity logging. Built with Node.js/Express (backend) and Vanilla JavaScript (frontend).  

## 🚀 Features
- 🔐 JWT authentication & role-based access control
- 📊 Dashboard with charts & statistics (Chart.js)
- 👥 User management (CRUD, search, filter)
- 📦 Product management (CRUD, image uploads)
- 📝 Activity logs & audit trails
- 🎨 Responsive UI with dark/light mode

## 🏗️ Tech Stack
- **Backend:** Node.js, Express, JSON file-based DB (upgradeable to Mongo)
- **Frontend:** HTML, CSS, Vanilla JS, Chart.js, Bootstrap
- **Security:** JWT, bcrypt, helmet, CORS, input validation

## ⚡ Quick Start

```bash
# Clone repo
git clone https://github.com/yourusername/admin-dashboard.git
cd admin-dashboard

# Backend setup
cd backend
npm install
cp .env.example .env
npm run dev

# Frontend setup
cd ../frontend
npm install
npm start

📁 Project Structure
admin-dashboard/
├── backend/
│   ├── src/        # controllers, models, routes, utils, middleware
│   ├── data/       # users.json, products.json, logs.json
│   ├── uploads/
│   └── server.js
└── frontend/
    ├── public/     # HTML, CSS, JS, images
    └── pages/ 
