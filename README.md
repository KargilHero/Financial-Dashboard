
# 💰 Financial Dashboard Web App

A comprehensive, full-stack **Financial Dashboard** to help users manage and analyze their finances effectively. Features include a personalized finance dashboard, financial tools, to-do list, stock tracking, contact form, and admin panel — all integrated with user authentication and real-time database support.

---

## 🚀 Features

- ✅ **User Authentication** (Login, Register, Sessions)
- 📈 **Financial Dashboard** with charts and key metrics
- 🧮 **Finance Tools**:
  - Net Worth Calculator
  - Loan & EMI Calculator
  - Tax Estimator
  - Retirement Planner
  - Debt Payoff Planner
- 📝 **To-Do List Manager** (User-specific)
- 💱 **Currency Converter**
- 📊 **Stock Market Info** (Graphs & News)
- 📬 **Contact Form** (with Admin message viewing panel)
- 📧 **Password Recovery** using **Nodemailer**
- 📉 **Real-Time Data Visualization** with charts

---

## 🧰 Tech Stack

### Frontend:
- **HTML5**, **CSS3**, **JavaScript (ES6+)**
- **Responsive Design**
- **Chart.js / ApexCharts** *(for dynamic graphs)*
- **Custom JavaScript Features**: 
  - Smooth scroll
  - Animated counters
  - Modals & Preloaders
  - Sound toggle
  - Parallax effects

### Backend:
- **Node.js** with **Express.js**
- **MySQL** for persistent data storage
- **bcrypt** for password hashing
- **express-session** for session handling
- **Nodemailer** for email services (e.g., password reset)

---

## 📁 Project Structure (Basic Overview)

```
financial-dashboard/
├── public/
│   ├── css/
│   ├── js/
│   └── images/
├── views/
│   └── *.ejs or *.html files
├── routes/
│   └── userRoutes.js, adminRoutes.js, authRoutes.js
├── controllers/
├── models/
├── app.js
├── package.json
└── README.md
```

---

## 📦 Installation

```bash
git clone https://github.com/KargilHero/financial-dashboard.git
cd financial-dashboard
npm install
```

### Set up `.env` file with:
```
DB_HOST=localhost
DB_USER=yourusername
DB_PASS=yourpassword
DB_NAME=financial_dashboard
SESSION_SECRET=your_session_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

### Start the server:

```bash
npm start
```

---

## 🛠 Future Improvements

- 🔐 Add 2FA for login
- 📲 Add mobile app using React Native
- 📤 Export data as PDF/Excel
- 📆 Add calendar-based bill reminders
- 🧠 AI-powered financial insights

---


## 🧑‍💻 Author

**KargilHero**  
[LinkedIn](https://www.linkedin.com/in/dev-sharma-29a71823b/) • [GitHub](https://github.com/KargilHero) • [Portfolio](#)
