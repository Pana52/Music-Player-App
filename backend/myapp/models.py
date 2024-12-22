from django.db import models
class Song(models.Model):
    title = models.CharField(max_length=255)  # Song title
    artist = models.CharField(max_length=255)  # Artist name
    album = models.CharField(max_length=255, blank=True, null=True)  # Album name (optional)
    albumImage = models.ImageField(upload_to='music data/album covers/', blank=True, null=True)  # Album art (optional)
    duration = models.DurationField()  # Duration of the song
    file_path = models.FilePathField(path="media/music/", match=".*\.mp3$", recursive=True)  # Path to the song file
    added_at = models.DateTimeField(auto_now_add=True)  # Date the song was added

    def __str__(self):
        return f"{self.title} by {self.artist}"
