from django.contrib import admin
<<<<<<< HEAD

# Register your models here.
=======
from .models import Course
from .models import Exams
from .models import Marks

# Register your models here.
admin.site.register(Course)
admin.site.register(Exams)
admin.site.register(Marks)
>>>>>>> 917432b0b93bb150a6cd425d9ac0e03b85e1b17a
