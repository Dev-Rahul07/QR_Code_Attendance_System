from django.db import models
from datetime import date

class Student(models.Model):
    name = models.CharField(max_length=100)
    roll_no = models.CharField(max_length=2, unique=True, primary_key=True)
    email = models.EmailField()
    qr_code = models.ImageField(upload_to="qr_codes/", null=True, blank=True)
    attendance_count = models.IntegerField(default=0)

    def __str__(self):
        return self.name


class Teacher(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class AttendanceRecord(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    date = models.DateField(default=date.today)
    status = models.CharField(max_length=10, choices=[('Present', 'Present'), ('Absent', 'Absent')])

    def __str__(self):
        return f"{self.student.name} - {self.date} - {self.status}"
