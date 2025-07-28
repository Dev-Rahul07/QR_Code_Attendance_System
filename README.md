# QR Code Based Attendance System (Django)

## 📌 Description

This is a web-based attendance system built using **Python Django**.  
It allows teachers to mark student attendance by **scanning QR codes**, and also provides manual attendance, login systems, export to Excel, and a clean UI.

It is designed to make attendance fast, error-free, and paperless.

---

## 🚀 Features

### 👨‍🎓 Student Module
- Register as student with basic info
- Generates unique QR Code when they login


### 👨‍🏫 Teacher Module
- Register & login
- View all students
- Mark attendance:
  - ✅ By scanning student QR code
- View attendance records
- Export attendance to Excel


### 🎨 UI Features
- Beautiful home page with background or gradient
- Navbar with logo
- Footer with basic info
- Loading animations
- Mobile responsive design
- Toast messages for alerts

---

## 🛠️ Technologies Used

- **Frontend:** HTML, CSS, Bootstrap, JavaScript
- **Backend:** Python, Django
- **Database:** SQLite
- **Libraries:** qrcode, pandas, openpyxl

---

## 📂 Folder Structure (Short)

```
attendance_app/
├── templates/
│   ├── student_register.html
│   ├── teacher_dashboard.html
├── static/
│   ├── css/
│   ├── js/
│   └── images/
├── media/
│   └── qr_codes/
├── attendance/
│   ├── models.py
│   ├── views.py
│   ├── urls.py
│   └── forms.py
├── manage.py
└── db.sqlite3
```

---

## 💻 How to Run Locally

```bash
git clone https://github.com/your-username/your-repo-name.git
cd attendance_app
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

Open browser → `http://127.0.0.1:8000/`

---

## 📈 Future Improvements

- Face recognition for attendance (optional)
- Email or popup notifications for absentees
- Admin panel with full CRUD access
- Holiday/weekend detection

---

## 🙋 Author

**Rahul Pandit**  
BCA Graduate | Python Developer  
Email:  panditbyte@email.com

---

## ⭐ GitHub Repo

If you like this project, give it a ⭐ on GitHub!
