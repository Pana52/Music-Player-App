from django.db import models

class Artist(models.Model):
    name = models.CharField(max_length=255)
    profile_pic = models.ImageField(upload_to='artists/', null=True, blank=True)

    def __str__(self):
        return self.name

class Genre(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Album(models.Model):
    title = models.CharField(max_length=255)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE, related_name='albums')
    release_date = models.DateField()
    cover_image = models.ImageField(upload_to='albums/', null=True, blank=True)

    def __str__(self):
        return self.title

class Song(models.Model):
    title = models.CharField(max_length=255)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE, related_name='songs')
    album = models.ForeignKey(Album, on_delete=models.SET_NULL, null=True, blank=True, related_name='songs')
    genre = models.ForeignKey(Genre, on_delete=models.SET_NULL, null=True, blank=True, related_name='songs')
    duration = models.DurationField()
    release_date = models.DateField()
    file = models.FileField(upload_to='music/')
    cover_image = models.ImageField(upload_to='songs/', null=True, blank=True)

    def __str__(self):
        return self.title
