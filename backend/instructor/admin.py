from django.contrib import admin
from .models import Class
from .models import Exams
from .models import Marks

# Register your models here.
admin.site.register(Class)
admin.site.register(Exams)
admin.site.register(Marks)
