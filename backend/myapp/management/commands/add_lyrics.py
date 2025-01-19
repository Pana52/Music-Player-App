import os
import lyricsgenius
from django.core.management.base import BaseCommand
from dotenv import load_dotenv

class Command(BaseCommand):
    help = 'Fetch lyrics for a given song title and artist and save them as a text file.'

    def add_arguments(self, parser):
        parser.add_argument('title', type=str, help='The title of the song')
        parser.add_argument('artist', type=str, help='The artist of the song')

    def handle(self, *args, **kwargs):
        title = kwargs['title']
        artist = kwargs['artist']
        lyrics = self.fetch_lyrics(title, artist)
        if lyrics:
            self.save_lyrics(title, artist, lyrics)
        else:
            self.stdout.write(self.style.ERROR('Lyrics not found.'))

    def fetch_lyrics(self, title, artist):
        load_dotenv(dotenv_path='D:/Music-Player-App/.env')
        genius_api_token = os.getenv('REACT_APP_GENIUS_ACCESS_TOKEN')
        if not genius_api_token:
            self.stdout.write(self.style.ERROR('Genius API token not found in .env file'))
            return None
        try:
            genius = lyricsgenius.Genius(genius_api_token)
            song = genius.search_song(title, artist)
            if song:
                return song.lyrics
        except TypeError as e:
            self.stdout.write(self.style.ERROR(f'Error with Genius API token: {e}'))
        return None

    def save_lyrics(self, title, artist, lyrics):
        directory = 'D:/Music-Player-App/media/music data/lyrics/'
        if not os.path.exists(directory):
            os.makedirs(directory)
        filename = f"{artist} - {title}.txt"
        filepath = os.path.join(directory, filename)
        with open(filepath, 'w', encoding='utf-8') as file:
            file.write(lyrics)
        self.stdout.write(self.style.SUCCESS(f'Lyrics saved to {filepath}'))
        return filepath  # Return the path of the created lyrics text file
