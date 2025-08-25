from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import ZoomWebinarSerializer, ZoomWebinarListSerializer, ZoomOccurrenceSerializer, ZoomWebinarSerilizer
from .models import ZoomWebinar
from .zoom_api import ZoomAPIClient
import traceback
from .services import ZoomWebinarService
from rest_framework.decorators import api_view, action
from django.shortcuts import get_object_or_404, render
from decimal import Decimal
from instructor.models import Class, ClassSchedule
from instructor.serializers import ClassSerializer
from .serializers import ZoomWebinarSerializer, ZoomWebinarListSerializer, ZoomOccurrenceSerializer, ZoomWebinarSerilizer
from django.contrib.auth import get_user_model
from accounts.serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.decorators import api_view, permission_classes
from .permissions import IsAdminRole

# Add a simple admin test endpoint
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_test(request):
    """Test endpoint to verify admin authentication"""
    user = request.user
    return Response({
        'message': 'Admin authentication test successful',
        'user': {
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'is_authenticated': user.is_authenticated,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser
        }
    }, status=status.HTTP_200_OK)
from students.models import Payment, ReceiptPayment
from students.serializers import PaymentSerializer, ReceiptPaymentSerializer
from django.conf import settings
from datetime import datetime, timedelta
import pytz
from django.utils.dateparse import parse_time, parse_date
from rest_framework import viewsets

User = get_user_model()

# Define valid days for weekly repeat
VALID_ZOOM_WEEKDAYS = [1, 2, 3, 4, 5, 6, 7]


# Create your views here.
class CreateZoomWebinarView(APIView):
    def post(self, request):
        serializer = ZoomWebinarSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data

        try:
            zoom = ZoomAPIClient(data['account_key'])
            webinar_data = zoom.create_webinar(
                topic=data['topic'],
                start_time=data['start_time'],
                duration=data['duration'],
                agenda=data.get('agenda', ''),
                repeat_type=data.get('repeat_type'),
                repeat_interval=data.get('repeat_interval', 1),
                end_date_time=data.get('end_date_time'),
                weekly_days=data.get('weekly_days')  # <-- Pass weekly_days
            )
            return Response({
                "message": "Webinar created successfully",
                "data": webinar_data
            }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)         

class ListZoomWebinarsView(APIView):
    def get(self, request):
        serializer = ZoomWebinarListSerializer(data=request.query_params)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        account_key = serializer.validated_data.get("account_key")
        if not account_key:
            return Response({"error": "account_key is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            service = ZoomWebinarService(account_key)
            webinars = service.get_all_detailed_webinars()

            return Response({"webinars": webinars}, status=status.HTTP_200_OK)

        except Exception as e:
            print("🔥 Zoom API Error:")
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class SyncZoomWebinarsView(APIView):
    def post(self, request):
        serializer = ZoomWebinarListSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        account_key = serializer.validated_data.get("account_key")

        try:
            service = ZoomWebinarService(account_key)
            service.sync_webinars_to_db()
            return Response({"message": "Webinars synced successfully"}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
        
        
class WebinarListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        webinars = ZoomWebinar.objects.all().order_by('-start_time')
        serializer = ZoomWebinarSerilizer(webinars, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# get zoom accounts
class ZoomAccountsListView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        return Response([
            {"key": k, "email": v["user_id"]}
            for k, v in settings.ZOOM_ACCOUNTS.items()
        ])

class CreateClassWithWebinarView(APIView):
    def post(self, request):
        data = request.data
        try:
            title = data.get("title")
            description = data.get("description")
            fee = data.get("fee")
            start_date = parse_date(data.get("start_date"))
            end_date = parse_date(data.get("end_date"))
            schedules = data.get("schedules", [])
            zoom_schedule = data.get("zoom_schedule")
            zoom_account_key = data.get("zoom_account_key")
            repeat_type = data.get("repeat_type", "weekly")

            if not (title and start_date and end_date and zoom_schedule):
                return Response({"error": "Missing required fields"}, status=400)
            

            # 🕐 Parse times & weekly days
            colombo_tz = pytz.timezone("Asia/Colombo")
            zoom_start_time = parse_time(zoom_schedule["start_time"])
            zoom_duration = int(zoom_schedule["duration_minutes"])
            weekly_days = zoom_schedule["weekly_days"]  # Example: [2, 4, 6]

            # ✅ Validate weekday numbers
            if not all(day in VALID_ZOOM_WEEKDAYS for day in weekly_days):
                return Response({"error": "weekly_days must be integers 1 (Sunday) to 7 (Saturday)"}, status=400)

            # 📅 Combine date & time, apply timezone
            combined_start_dt = colombo_tz.localize(datetime.combine(start_date, zoom_start_time))

            # 🔁 Adjust end date to nearest valid weekday before or on end_date
            current = end_date
            while current >= start_date:
                # weekday() gives Monday=0, Sunday=6 → Zoom: Sunday=1, Monday=2, ..., Saturday=7
                zoom_day = (current.weekday() + 1) % 7 + 1
                if zoom_day in weekly_days:
                    break
                current -= timedelta(days=1)

            if current < start_date:
                return Response({"error": "No valid weekday found between start_date and end_date"}, status=400)

            # ⏳ Final end datetime
            end_datetime = colombo_tz.localize(datetime.combine(current, zoom_start_time) + timedelta(minutes=zoom_duration))
            def calculate_occurrence_count(start_date, end_date, weekly_days):
                count = 0
                current = start_date
                weekday_set = set(weekly_days)

                while current <= end_date:
                    if current.isoweekday() in weekday_set:
                        count += 1
                    current += timedelta(days=1)
                
                return count
            end_times = calculate_occurrence_count(start_date, end_date, weekly_days)

            # 🔗 Call Zoom service
            zoom_service = ZoomWebinarService(zoom_account_key)
            webinar_obj, zoom_data = zoom_service.create_and_save_webinar(
                topic=title,
                start_time=combined_start_dt,
                duration=zoom_duration,
                agenda=description,
                repeat_type=repeat_type,
                end_date_time=end_datetime,
                weekly_days=weekly_days,
                end_times=end_times,  # Pass end_times to the service
            )

            # 🎓 Create Class
            new_class = Class.objects.create(
                title=title,
                description=description,
                fee=fee,
                start_date=start_date,
                end_date=end_date,
                instructor=User.objects.filter(role="instructor").first(),  # Replace with actual logic
                webinar=webinar_obj
            )

            # 🗓️ Create ClassSchedule records
            for sched in schedules:
                for day in sched["days_of_week"]:
                    ClassSchedule.objects.create(
                        class_obj=new_class,
                        day_of_week=day,
                        start_time=parse_time(sched["start_time"]),
                        duration_minutes=int(sched["duration_minutes"]),
                    )

            # ✅ Serialize and respond - refetch with relations
            created_class = Class.objects.select_related('instructor').prefetch_related('schedules').get(id=new_class.id)
            serializer = ClassSerializer(created_class)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            print("🔥 Error in CreateClassWithWebinarView:", str(e))
            return Response({"error": str(e)}, status=500)

class ClassListView(APIView):
    permission_classes = [IsAuthenticated]  # or IsAdminUser if needed

    def get(self, request):
        classes = Class.objects.select_related('instructor').prefetch_related('schedules').all().order_by('-start_date')
        serializer = ClassSerializer(classes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class StudentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        students = User.objects.filter(role='student').select_related('student_profile')
        serializer = UserSerializer(students, many=True)
        return Response(serializer.data)

class PaymentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        payments = Payment.objects.select_related('stuid').all().order_by('-date')
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)
        
class ReceiptPaymentAdminViewSet(viewsets.ModelViewSet):
    queryset = ReceiptPayment.objects.select_related("payid", "payid__stuid")
    serializer_class = ReceiptPaymentSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]
    lookup_field = "receiptid"

    @action(detail=True, methods=["post"])
    def verify(self, request, receiptid=None):
        # 🔄 Force fresh DB fetch (not cached)
        receipt = get_object_or_404(ReceiptPayment.objects.select_related("payid"), receiptid=receiptid)

        payment = receipt.payid
        paid_amount_decimal = Decimal(str(receipt.paid_amount or "0"))
        print(f"🔄 Syncing receipt amount: {paid_amount_decimal} to payment {payment.payid} and {payment.amount}"   )
        print(f"🔄 Current payment status: {payment}")
        updated_fields = []
        if payment.amount != paid_amount_decimal:
            print(f"🔄 Updating payment amount from {payment.amount} to {paid_amount_decimal}")
            payment.amount = paid_amount_decimal
            updated_fields.append("amount")
            print(f"🔄 Updated payment amount: {payment.amount}")

        if updated_fields:
            payment.save(update_fields=updated_fields)

        # 🔍 Duplicate check
        duplicates = ReceiptPayment.objects.filter(
            verified=True,
            record_no=receipt.record_no,
            paid_date_time=receipt.paid_date_time,
            location=receipt.location
        ).exclude(pk=receipt.pk)

        if duplicates.exists():
            return Response(
                {"detail": "Duplicate receipt found with same record number, date, and location."},
                status=status.HTTP_409_CONFLICT
            )

        # ✅ Mark as verified
        receipt.verified = True
        receipt.save(update_fields=["verified"])

        # ✅ Sync to payment table
        # payment = receipt.payid
        # paid_amount_decimal = Decimal(str(receipt.paid_amount or "0"))
        # print(f"🔄 Syncing receipt amount: {paid_amount_decimal} to payment {payment.payid}"   )
        # print(f"🔄 Current payment status: {payment}")
        # updated_fields = []
        # if payment.amount != paid_amount_decimal:
        #     payment.amount = paid_amount_decimal
        #     updated_fields.append("amount")

        if payment.status not in ["success", "completed"]:
            payment.status = "success"
            updated_fields.append("status")

        if updated_fields:
            payment.save(update_fields=updated_fields)

        return Response({
            "detail": "Receipt verified, amount synced, and payment marked as successful."
        })

class ComprehensiveWebinarSyncView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Comprehensive sync that:
        1. Syncs webinars from all Zoom accounts
        2. Creates classes for webinars without associated classes
        """
        try:
            from django.conf import settings
            
            results = {}
            total_created_classes = 0
            
            # Sync from all configured Zoom accounts
            for account_key in settings.ZOOM_ACCOUNTS.keys():
                try:
                    service = ZoomWebinarService(account_key)
                    result = service.sync_webinars_and_create_classes()
                    results[account_key] = result
                    total_created_classes += result['created_classes']
                    
                except Exception as e:
                    results[account_key] = {'error': str(e)}
                    print(f"Error syncing account {account_key}: {e}")
            
            return Response({
                'message': 'Comprehensive webinar sync completed',
                'total_created_classes': total_created_classes,
                'results_by_account': results
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Sync failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class WebinarSyncStatusView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get sync status and statistics about webinars and classes
        """
        try:
            # Count total webinars
            total_webinars = ZoomWebinar.objects.count()
            
            # Count webinars with associated classes
            webinars_with_classes = Class.objects.filter(
                webinar__isnull=False
            ).values_list('webinar__webinar_id', flat=True)
            
            webinars_without_classes_count = ZoomWebinar.objects.exclude(
                webinar_id__in=webinars_with_classes
            ).count()
            
            # Count total classes
            total_classes = Class.objects.count()
            
            # Count classes with webinars
            classes_with_webinars = Class.objects.filter(webinar__isnull=False).count()
            
            return Response({
                'total_webinars': total_webinars,
                'webinars_with_classes': len(webinars_with_classes),
                'webinars_without_classes': webinars_without_classes_count,
                'total_classes': total_classes,
                'classes_with_webinars': classes_with_webinars,
                'sync_needed': webinars_without_classes_count > 0
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to get sync status: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CreateClassFromWebinarView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Create a class from a specific webinar
        """
        try:
            webinar_id = request.data.get('webinar_id')
            account_key = request.data.get('account_key')
            
            if not webinar_id:
                return Response({
                    'error': 'webinar_id is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get the webinar
            try:
                webinar = ZoomWebinar.objects.get(webinar_id=webinar_id)
            except ZoomWebinar.DoesNotExist:
                return Response({
                    'error': 'Webinar not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Check if class already exists for this webinar
            if Class.objects.filter(webinar=webinar).exists():
                return Response({
                    'error': 'Class already exists for this webinar'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create the class
            service = ZoomWebinarService(account_key or webinar.account_key)
            new_class = service._create_class_from_webinar(webinar)
            
            if new_class:
                from instructor.serializers import ClassSerializer
                serializer = ClassSerializer(new_class)
                return Response({
                    'message': 'Class created successfully',
                    'class': serializer.data
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'error': 'Failed to create class'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            return Response({
                'error': f'Failed to create class: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UpdateClassView(APIView):
    permission_classes = [IsAuthenticated]  # only authenticated users (admins)

    def put(self, request, class_id):
        try:
            class_obj = Class.objects.get(id=class_id)
        except Class.DoesNotExist:
            return Response({"error": "Class not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if this is an update-only operation (no webinar changes)
        update_only = request.data.get('update_only', False)
        
        if update_only:
            # Only update basic class information and schedules, not webinar-related fields
            allowed_fields = ['title', 'description', 'fee', 'start_date', 'end_date', 'status', 'schedules']
            update_data = {k: v for k, v in request.data.items() if k in allowed_fields}
            
            serializer = ClassSerializer(class_obj, data=update_data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "message": "Class details and schedules updated successfully (webinar settings unchanged)",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Full update including potential webinar changes
            serializer = ClassSerializer(class_obj, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            from django.utils import timezone
            from django.db.models import Sum, Count, Q
            from datetime import datetime, timedelta
            
            now = timezone.now()
            current_month = now.replace(day=1)
            last_month = (current_month - timedelta(days=1)).replace(day=1)
            
            # Get basic stats
            total_users = User.objects.count()
            total_students = User.objects.filter(role='student').count()
            total_instructors = User.objects.filter(role='instructor').count()
            total_classes = Class.objects.count()
            
            # Calculate active classes (those whose end_date is in the future)
            active_classes = Class.objects.filter(start_date__lte=now.date(),end_date__gte=now.date()).count()
            
            total_webinars = ZoomWebinar.objects.count()
            
            # Payment stats - count both 'success' and 'completed' as verified
            total_payments = Payment.objects.count()
            verified_payments = Payment.objects.filter(status__in=['success', 'completed']).count()
            pending_payments = Payment.objects.filter(status='pending').count()
            
            # Revenue calculations - include both success and completed payments
            total_revenue = Payment.objects.filter(status__in=['success', 'completed']).aggregate(
                total=Sum('amount')
            )['total'] or 0
            
            current_month_revenue = Payment.objects.filter(
                status__in=['success', 'completed'],
                date__gte=current_month
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            last_month_revenue = Payment.objects.filter(
                status__in=['success', 'completed'],
                date__gte=last_month,
                date__lt=current_month
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            # Calculate growth
            revenue_growth = 0
            if last_month_revenue > 0:
                revenue_growth = ((current_month_revenue - last_month_revenue) / last_month_revenue) * 100
            
            # Student enrollment this month vs last month
            students_this_month = User.objects.filter(
                role='student',
                date_joined__gte=current_month
            ).count()
            
            students_last_month = User.objects.filter(
                role='student',
                date_joined__gte=last_month,
                date_joined__lt=current_month
            ).count()
            
            student_growth = 0
            if students_last_month > 0:
                student_growth = ((students_this_month - students_last_month) / students_last_month) * 100
            
            stats = {
                'users': {
                    'total': total_users,
                    'students': total_students,
                    'instructors': total_instructors,
                    'students_this_month': students_this_month,
                    'students_last_month': students_last_month,
                    'student_growth': round(student_growth, 1)
                },
                'classes': {
                    'total': total_classes,
                    'active': active_classes,
                    'completed': total_classes - active_classes,
                    'utilization': round((active_classes / total_classes * 100), 1) if total_classes > 0 else 0
                },
                'webinars': {
                    'total': total_webinars,
                },
                'payments': {
                    'total': total_payments,
                    'verified': verified_payments,
                    'pending': pending_payments,
                    'success_rate': round((verified_payments / total_payments * 100), 1) if total_payments > 0 else 0
                },
                'revenue': {
                    'total': float(total_revenue),
                    'current_month': float(current_month_revenue),
                    'last_month': float(last_month_revenue),
                    'growth': round(revenue_growth, 1)
                }
            }
            
            return Response(stats, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": f"Failed to fetch dashboard stats: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ComprehensiveReportsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            from django.utils import timezone
            from django.db.models import Sum, Count, Q, Avg
            from datetime import datetime, timedelta
            from students.models import Enrollment
            
            now = timezone.now()
            current_month = now.replace(day=1)
            
            # Subject/Class statistics (based on class titles)
            class_subjects = Class.objects.annotate(
                enrollment_count=Count('enrollment', distinct=True),
                revenue_generated=Sum('enrollment__payid__amount', filter=Q(enrollment__payid__status='success'))
            ).order_by('-enrollment_count')[:10]
            
            # Monthly enrollment and revenue trends (last 6 months)
            monthly_stats = []
            for i in range(6):
                month_start = (current_month - timedelta(days=30*i)).replace(day=1)
                next_month = (month_start + timedelta(days=32)).replace(day=1)
                
                enrollments = User.objects.filter(
                    role='student',
                    date_joined__gte=month_start,
                    date_joined__lt=next_month
                ).count()
                
                revenue = Payment.objects.filter(
                    status='success',
                    date__gte=month_start.date(),
                    date__lt=next_month.date()
                ).aggregate(total=Sum('amount'))['total'] or 0
                
                monthly_stats.append({
                    'month': month_start.strftime('%Y-%m'),
                    'month_name': month_start.strftime('%B %Y'),
                    'enrollments': enrollments,
                    'revenue': float(revenue)
                })
            
            # Payment method breakdown
            payment_methods = Payment.objects.values('method').annotate(
                count=Count('id'),
                total_amount=Sum('amount', filter=Q(status__in=['success', 'completed']))
            )
            
            # Class performance metrics
            class_performance = Class.objects.annotate(
                enrollment_count=Count('enrollment'),
                revenue_generated=Sum('enrollment__payid__amount', filter=Q(enrollment__payid__status__in=['success', 'completed']))
            ).order_by('-enrollment_count')[:10]
            
            # Instructor statistics
            instructor_stats = User.objects.filter(role='instructor').annotate(
                class_count=Count('class'),
                total_students=Count('class__enrollment', distinct=True)
            ).order_by('-class_count')[:10]
            
            report_data = {
                'subjects': [
                    {
                        'name': cls.title,
                        'students': cls.enrollment_count or 0,
                        'classes': 1,  # Each class entry represents one class
                        'revenue': float(cls.revenue_generated or 0),
                        'avg_per_student': float(cls.revenue_generated or 0) / max(cls.enrollment_count or 1, 1)
                    } for cls in class_subjects if cls.title
                ],
                'monthly_trends': list(reversed(monthly_stats)),
                'payment_methods': [
                    {
                        'method': item['method'],
                        'count': item['count'],
                        'total_amount': float(item['total_amount'] or 0)
                    } for item in payment_methods
                ],
                'top_classes': [
                    {
                        'name': cls.title,
                        'instructor': cls.instructor.get_full_name() or cls.instructor.username,
                        'enrollments': cls.enrollment_count or 0,
                        'revenue': float(cls.revenue_generated or 0),
                        'fee': float(cls.fee)
                    } for cls in class_performance if cls.title
                ],
                'instructors': [
                    {
                        'name': instructor.get_full_name() or instructor.username,
                        'email': instructor.email,
                        'classes': instructor.class_count,
                        'students': instructor.total_students or 0
                    } for instructor in instructor_stats
                ]
            }
            
            return Response(report_data, status=status.HTTP_200_OK)
        except Exception as e:
            import traceback
            print(f"Reports API Error: {str(e)}")
            print(traceback.format_exc())
            return Response(
                {"error": f"Failed to fetch reports: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )