from django.db import models

class Song(models.Model):
    title = models.CharField(max_length=100)
    artist = models.CharField(max_length=100)
    album = models.CharField(max_length=100, blank=True, null=True)
    genre = models.CharField(max_length=50, blank=True, null=True)
    duration = models.DurationField()
    release_date = models.DateField(blank=True, null=True)

    def __str__(self):
        return f"{self.title} by {self.artist}"
