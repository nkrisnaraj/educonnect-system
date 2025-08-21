from django.contrib import admin
from .models import (
    StudentProfile, Enrollment, Payment, OnlinePayment, ReceiptPayment,
    ChatRoom, Message, MessageReaction, ChatNotification, CalendarEvent, Notification
)


# Register your models here.
admin.site.register(StudentProfile)
admin.site.register(Payment)
admin.site.register(OnlinePayment)
admin.site.register(ReceiptPayment)
admin.site.register(Enrollment)

# Chat models
admin.site.register(ChatRoom)
admin.site.register(Message)
admin.site.register(MessageReaction)
admin.site.register(ChatNotification)
admin.site.register(CalendarEvent)
admin.site.register(Notification)




