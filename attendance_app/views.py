from django.shortcuts import render, redirect
from .models import Student, Teacher, AttendanceRecord
import qrcode
from io import BytesIO
from django.core.files import File
from django.http import HttpResponse
import cv2
import base64
import datetime
import pandas as pd


def contact_page(request):
    return render(request, 'contact_page.html')



def home(request):
    return render(request, 'home.html')


def student_register(request):
    if request.method == "POST":
        name = request.POST.get("student_name")
        roll = request.POST.get("roll")
        email = request.POST.get("email")

        s = Student(name=name, roll_no=roll, email=email)
        s.save()

        data = {
            'student_name': s.name,
            'student_roll_number': s.roll_no,
            'student_email': s.email
        }
        return redirect('success_page')

    return render(request, 'student_register.html')

def teacher_register(request):
    if request.method == "POST":
        name = request.POST.get("teacher_name")
        email = request.POST.get("email")
        password = request.POST.get("password")

        t = Teacher(name=name, email=email, password=password)
        t.save()

        return redirect('success_page')

    return render(request, 'teacher_register.html')


def success_page(request):
    return render(request, 'success_page.html')


def teacher_login(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")

        teachers = Teacher.objects.all()
        for teacher in teachers:
            if teacher.name == username and teacher.password == password:
                return redirect('teacher_dashboard')

    return render(request, 'teacher_login.html')


def student_login(request):
    if request.method == "POST":
        name = request.POST.get("name")
        roll_no = request.POST.get("roll_no")
        email = request.POST.get("Email")

        student = Student.objects.filter(name=name, roll_no=roll_no, email=email).first()
        if student:
            unique_data = f"{student.roll_no}_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"

            img = qrcode.make(unique_data)
            buffer = BytesIO()
            img.save(buffer, format='PNG')
            buffer.seek(0)

            img_base64 = base64.b64encode(buffer.getvalue()).decode()

            data = {
                'student_name': student.name,
                'student_roll_number': student.roll_no,
                'student_email': student.email,
                'qr_code_base64': img_base64,
                'qr_data': unique_data,
            }
            return render(request, 'qr_code_dynamic.html', data)
        else:
            return render(request, 'student_login.html', {'error': 'Invalid credentials!'})

    return render(request, 'student_login.html')


def qr_scan_page(request):
    today = datetime.date.today()
    all_students = Student.objects.all()

    # Mark absent if not already marked
    for s in all_students:
        if not AttendanceRecord.objects.filter(student=s, date=today).exists():
            AttendanceRecord.objects.create(student=s, status='Absent', date=today)

    cap = cv2.VideoCapture(0)
    detector = cv2.QRCodeDetector()

    while True:
        success, img = cap.read()
        if not success:
            continue

        data, bbox, _ = detector.detectAndDecode(img)
        if data:
            roll_no = data.split('_')[0]  # get only roll_no before '_'
            students = Student.objects.filter(roll_no=roll_no)
            if students.exists():
                student = students.first()
                AttendanceRecord.objects.update_or_create(
                    student=student,
                    date=today,
                    defaults={'status': 'Present'}
                )
                student.attendance_count += 1
                student.save()
                message = f"Attendance marked for {student.name} (Roll No: {student.roll_no})"
            else:
                message = "Student not found!"

            cap.release()
            cv2.destroyAllWindows()
            return render(request, 'attendance_marked.html', {'message': message})

        cv2.imshow("QR Scanner", img)
        if cv2.waitKey(1) == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    return render(request, 'attendance_marked.html', {'message': "QR Scan Cancelled"})

from django.shortcuts import render
from .models import Student, AttendanceRecord
from datetime import date

def teacher_dashboard(request):
    today = date.today()

    students = Student.objects.all()
    student_data = []

    for student in students:
        try:
            attendance = AttendanceRecord.objects.get(student=student, date=today)
            status = attendance.status
        except AttendanceRecord.DoesNotExist:
            status = 'Absent'

        student_data.append({
            'name': student.name,
            'roll_no': student.roll_no,
            'email': student.email,
            'attendance_count': student.attendance_count,
            'status': status,
        })

    total_students = students.count()
    present_today = AttendanceRecord.objects.filter(date=today, status='Present').count()
    absent_today = total_students - present_today

    context = {
        'date': today.strftime('%Y-%m-%d'),
        'students': student_data,
        'total_students': total_students,
        'present_today': present_today,
        'absent_today': absent_today,
    }
    return render(request, 'teacher_dashboard.html', context)


# def export_attendance(request):
#     selected_date = request.GET.get('date')
#     if selected_date:
#         date = datetime.datetime.strptime(selected_date, "%Y-%m-%d").date()
#     else:
#         date = datetime.date.today()

#     students = Student.objects.all()
#     rows = []

#     for student in students:
#         attendance = AttendanceRecord.objects.filter(student=student, date=date).first()
#         status = "Present" if attendance else "Absent"
#         rows.append([student.name, student.roll_no, student.email, student.attendance_count, status])

#     df = pd.DataFrame(rows, columns=['Name', 'Roll No', 'Email', 'Attendance Count', 'Status'])

#     response = HttpResponse(content_type='application/vnd.ms-excel')
#     response['Content-Disposition'] = f'attachment; filename=Attendance_{date}.xlsx'
#     df.to_excel(response, index=False)

#     return response


# def contact_page(request):
#     return render(request, 'contact_page.html')


import datetime
import pandas as pd
from django.http import HttpResponse
from .models import Student, AttendanceRecord

def export_attendance(request):
    selected_date = request.GET.get('date')
    if selected_date:
        date = datetime.datetime.strptime(selected_date, "%Y-%m-%d").date()
    else:
        date = datetime.date.today()

    students = Student.objects.all()
    rows = []

    for student in students:
        attendance = AttendanceRecord.objects.filter(student=student, date=date).first()
        if attendance:
            status = attendance.status  # Use real status (Present or Absent)
        else:
            status = "Absent"  # Default if no record found
        rows.append([student.name, student.roll_no, student.email, student.attendance_count, status])

    df = pd.DataFrame(rows, columns=['Name', 'Roll No', 'Email', 'Attendance Count', 'Status'])

    response = HttpResponse(content_type='application/vnd.ms-excel')
    response['Content-Disposition'] = f'attachment; filename=Attendance_{date}.xlsx'
    df.to_excel(response, index=False)

    return response
