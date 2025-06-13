from django.contrib import admin
from .models import StudentProfile
from .models import Enrollment
from .models import Payment, OnlinePayment, ReceiptPayment


# Register your models here.
admin.site.register(StudentProfile)
admin.site.register(Payment)
admin.site.register(OnlinePayment)
admin.site.register(ReceiptPayment)
admin.site.register(Enrollment)




