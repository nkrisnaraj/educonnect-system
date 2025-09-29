from django.core.management.base import BaseCommand
from django.db import models
from instructor.models import Exam
import uuid


class Command(BaseCommand):
    help = 'Fix exams with empty examid values'

    def handle(self, *args, **options):
        # Find exams with empty examid
        empty_examid_exams = Exam.objects.filter(examid='')
        count = empty_examid_exams.count()
        
        if count == 0:
            self.stdout.write(
                self.style.SUCCESS('No exams with empty examid found.')
            )
            return
        
        self.stdout.write(f'Found {count} exams with empty examid. Fixing...')
        
        fixed_count = 0
        for exam in empty_examid_exams:
            old_examid = exam.examid
            # Generate new examid using the same pattern as the model
            exam.examid = f"EXM-{uuid.uuid4().hex[:6].upper()}"
            try:
                exam.save()
                fixed_count += 1
                self.stdout.write(f'Fixed exam ID {exam.id}: "{old_examid}" -> "{exam.examid}"')
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Failed to fix exam ID {exam.id}: {e}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully fixed {fixed_count} out of {count} exams.')
        )
        
        # Check for any duplicates after fixing
        duplicates = Exam.objects.values('examid').annotate(
            count=models.Count('examid')
        ).filter(count__gt=1)
        
        if duplicates.exists():
            self.stdout.write(
                self.style.WARNING('Warning: Duplicate examids found after fixing:')
            )
            for dup in duplicates:
                self.stdout.write(f'  ExamID "{dup["examid"]}" appears {dup["count"]} times')