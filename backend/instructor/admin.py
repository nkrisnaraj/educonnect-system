from django.contrib import admin

from .models import Course
from .models import Exams
from .models import Marks

# Register your models here.
admin.site.register(Course)
admin.site.register(Exams)
admin.site.register(Marks)

