from django.db import models

# Create your models here.
class ZoomWebinar(models.Model):
    webinar_id = models.CharField(max_length=50, unique=True)
    account_key = models.CharField(max_length=100)
    topic = models.CharField(max_length=255)
    registration_url = models.URLField(null=True, blank=True)
    start_time = models.DateTimeField()
    duration = models.IntegerField()
    agenda = models.TextField(blank=True, null=True)
    is_recurring = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.topic


class ZoomOccurrence(models.Model):
    webinar = models.ForeignKey(ZoomWebinar, related_name='occurrences', on_delete=models.CASCADE)
    occurrence_id = models.CharField(max_length=50)
    start_time = models.DateTimeField()
    duration = models.IntegerField()

    class Meta:
        unique_together = ('webinar', 'occurrence_id')
