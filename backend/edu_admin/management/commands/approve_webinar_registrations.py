from django.core.management.base import BaseCommand
from edu_admin.services import check_and_approve_paid_registrations


class Command(BaseCommand):
    help = 'Check and approve pending webinar registrations for paid students'

    def add_arguments(self, parser):
        parser.add_argument(
            '--webinar-id',
            type=str,
            help='Specific webinar ID to check (optional)',
        )

    def handle(self, *args, **options):
        webinar_id = options.get('webinar_id')
        
        if webinar_id:
            self.stdout.write(f'🎯 Checking webinar: {webinar_id}')
        else:
            self.stdout.write('🎯 Checking all webinars')
        
        try:
            result = check_and_approve_paid_registrations(webinar_id)
            
            if result['success']:
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✅ Success! {result["total_approved"]} registrations approved'
                    )
                )
                
                for webinar_result in result['results']:
                    if 'error' in webinar_result:
                        self.stdout.write(
                            self.style.ERROR(
                                f'❌ {webinar_result["webinar_topic"]}: {webinar_result["error"]}'
                            )
                        )
                    else:
                        self.stdout.write(
                            f'📊 {webinar_result["webinar_topic"]}: '
                            f'{webinar_result["approved_count"]}/{webinar_result["pending_count"]} approved'
                        )
            else:
                self.stdout.write(
                    self.style.ERROR(f'❌ Error: {result["error"]}')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Command failed: {str(e)}')
            )