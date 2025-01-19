import os
from django.core.management.base import BaseCommand
from myapp.models import Song
from mutagen.mp3 import MP3
from mutagen.id3 import ID3, APIC
from datetime import timedelta
from django.core.files.base import ContentFile
from django.core.files import File
from myapp.management.commands.add_lyrics import Command as AddLyricsCommand

class Command(BaseCommand):
    help = 'Add a song from the given file path to the database'
    
    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str, help='The path to the mp3 file')

    def handle(self, *args, **kwargs):
        file_path = kwargs['file_path']
        default_image_path = r'D:\Music-Player-App\frontend\my-app\public\default-album-cover.png'
        add_lyrics_command = AddLyricsCommand()

        if file_path.endswith('.mp3'):
            # Extract metadata using mutagen
            audio = MP3(file_path)
            tags = ID3(file_path)
            title = tags.get('TIT2', "Unknown").text[0] if tags.get('TIT2') else os.path.splitext(os.path.basename(file_path))[0]
            artist = tags.get('TPE1', "Unknown").text[0] if tags.get('TPE1') else "Unknown"
            album = tags.get('TALB', "Unknown").text[0] if tags.get('TALB') else None
            duration = timedelta(seconds=int(audio.info.length))  # Convert to timedelta

            # Extract album image
            album_image = None
            for tag in tags.values():
                if isinstance(tag, APIC):
                    album_image = ContentFile(tag.data)
                    break

            # Add the song to the database if it doesn't already exist
            song, created = Song.objects.get_or_create(
                file_path=file_path,  # Ensure uniqueness
                defaults={
                    'title': title,
                    'artist': artist,
                    'album': album,
                    'duration': duration,
                }
            )

            if created:
                if album_image:
                    song.albumImage.save(f"{title}_cover.jpg", album_image)
                else:
                    with open(default_image_path, 'rb') as f:
                        song.albumImage.save(f"{title}_default_cover.png", File(f))

                # Fetch and save lyrics
                lyrics = add_lyrics_command.fetch_lyrics(title, artist)
                if lyrics:
                    lyrics_path = add_lyrics_command.save_lyrics(title, artist, lyrics)
                    song.lyrics_path = lyrics_path
                    song.save()
                    self.stdout.write(f"Lyrics added for: {title}")
                else:
                    self.stdout.write(f"Lyrics not found for: {title}")

                self.stdout.write(f"Added: {title}")
            else:
                self.stdout.write(f"Skipped (duplicate): {file_path}")
