from django.db import models

class Song(models.Model):
    title = models.CharField(max_length=255)
    artist = models.CharField(max_length=255)
    album = models.CharField(max_length=255, blank=True, null=True)
    albumImage = models.ImageField(upload_to='music data/album covers/', blank=True, null=True)
    duration = models.DurationField()
    file_path = models.FilePathField(path="media/music/", match=".*\.mp3$", recursive=True)
    lyrics_path = models.FilePathField(path="media/music data/lyrics/", match=".*\.txt$", recursive=True, blank=True, null=True)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['title', 'artist']
    def __str__(self):
        return f"{self.title} by {self.artist}"

