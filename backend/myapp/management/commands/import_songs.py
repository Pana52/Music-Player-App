# myapp/management/commands/import_songs.py

import os
from django.core.management.base import BaseCommand
from myapp.models import Artist, Album, Genre, Song
from django.conf import settings
from datetime import timedelta
from mutagen import File
from mutagen.mp3 import MP3
from mutagen.flac import FLAC
from mutagen.mp4 import MP4

class Command(BaseCommand):
    help = 'Import songs from media/music/ directory'

    def handle(self, *args, **kwargs):
        music_dir = os.path.join(settings.MEDIA_ROOT, 'music')
        if not os.path.exists(music_dir):
            self.stdout.write(self.style.ERROR('Music directory does not exist.'))
            return

        # Iterate over files in the music directory
        for filename in os.listdir(music_dir):
            if filename.lower().endswith(('.mp3', '.wav', '.flac', '.m4a', '.aac')):
                file_path = os.path.join('music', filename)
                song_title = os.path.splitext(filename)[0]

                # Get the full file path
                full_file_path = os.path.join(music_dir, filename)

                # Initialize default values
                artist_name = 'Unknown Artist'
                album_title = 'Unknown Album'
                genre_name = 'Unknown Genre'
                duration = timedelta(minutes=3)  # Default duration

                # Try to read audio file metadata
                try:
                    audio = File(full_file_path)
                    if audio is not None and hasattr(audio, 'info') and hasattr(audio.info, 'length'):
                        duration = timedelta(seconds=int(audio.info.length))
                    else:
                        self.stdout.write(self.style.WARNING(f'Could not read duration for {filename}: Unsupported format or missing info'))

                    # Extract metadata
                    if isinstance(audio, MP3):
                        artist_name = audio.get('TPE1', [artist_name])[0]
                        album_title = audio.get('TALB', [album_title])[0]
                        genre_name = audio.get('TCON', [genre_name])[0]
                    elif isinstance(audio, FLAC):
                        artist_name = audio.get('artist', [artist_name])[0]
                        album_title = audio.get('album', [album_title])[0]
                        genre_name = audio.get('genre', [genre_name])[0]
                    elif isinstance(audio, MP4):
                        tags = audio.tags
                        artist_name = tags.get('\xa9ART', [artist_name])[0]
                        album_title = tags.get('\xa9alb', [album_title])[0]
                        genre_name = tags.get('\xa9gen', [genre_name])[0]
                    # Add more formats as needed
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f'Error reading metadata from {filename}: {e}'))

                # Get or create artist, album, and genre
                artist_obj, _ = Artist.objects.get_or_create(name=artist_name)
                album_obj, _ = Album.objects.get_or_create(
                    title=album_title,
                    artist=artist_obj,
                    defaults={'release_date': '2000-01-01'}  # Placeholder date
                )
                genre_obj, _ = Genre.objects.get_or_create(name=genre_name)

                # Check if song already exists
                if Song.objects.filter(title=song_title, artist=artist_obj).exists():
                    self.stdout.write(self.style.WARNING(f'Song "{song_title}" by {artist_name} already exists. Skipping.'))
                    continue

                # Create song instance
                song = Song.objects.create(
                    title=song_title,
                    artist=artist_obj,
                    album=album_obj,
                    genre=genre_obj,
                    duration=duration,
                    release_date=album_obj.release_date,  # Use album's release date
                    file=file_path,
                )
                self.stdout.write(self.style.SUCCESS(f'Imported "{song_title}" by {artist_name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Skipping non-audio file: {filename}'))
