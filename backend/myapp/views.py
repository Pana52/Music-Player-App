import os
from urllib.parse import unquote
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.conf import settings
from mutagen.mp3 import MP3
from mutagen.id3 import ID3, TIT2, TPE1, TALB
from .models import Artist, Genre, Album, Song
from .serializers import ArtistSerializer, GenreSerializer, AlbumSerializer, SongSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from django.views.decorators.csrf import csrf_exempt
import json

def home_view(request):
    return HttpResponse("Welcome to the Music Player App!")

@api_view(['GET'])
def list_music_files(request):
    music_dir = os.path.join(settings.MEDIA_ROOT, 'music')
    if not os.path.exists(music_dir):
        return JsonResponse({'error': 'Music directory not found'}, status=404)

    files = []
    for file_name in os.listdir(music_dir):
        file_path = os.path.join(music_dir, file_name)
        if os.path.isfile(file_path) and file_name.endswith('.mp3'):
            audio = MP3(file_path)
            metadata = {
                'filename': file_name,
                'title': audio.get('TIT2', file_name).text[0] if 'TIT2' in audio else 'Unknown Title',
                'artist': audio.get('TPE1', 'Unknown Artist').text[0] if 'TPE1' in audio else 'Unknown Artist',
                'album': audio.get('TALB', 'Unknown Album').text[0] if 'TALB' in audio else 'Unknown Album',
                'duration': round(audio.info.length, 2)  # Duration in seconds
            }
            files.append(metadata)

    return JsonResponse({'files': files})

@api_view(['GET'])
def get_music_file(request, filename):
    decoded_filename = unquote(filename)
    file_path = os.path.join(settings.MEDIA_ROOT, 'music', decoded_filename)
    if os.path.exists(file_path):
        with open(file_path, 'rb') as file:
            response = HttpResponse(file.read(), content_type="audio/mpeg")
            response['Content-Disposition'] = f'inline; filename={decoded_filename}'
            return response
    else:
        return JsonResponse({'error': 'File not found'}, status=404)

@api_view(['POST'])
def upload_music_file(request):
    if 'file' not in request.FILES:
        return JsonResponse({'error': 'No file provided'}, status=400)

    file = request.FILES['file']
    file_path = os.path.join(settings.MEDIA_ROOT, 'music', file.name)

    with open(file_path, 'wb+') as destination:
        for chunk in file.chunks():
            destination.write(chunk)

    return JsonResponse({'message': 'File uploaded successfully'})

@api_view(['DELETE'])
def delete_music_file(request, filename):
    decoded_filename = unquote(filename)
    file_path = os.path.join(settings.MEDIA_ROOT, 'music', decoded_filename)
    if os.path.exists(file_path):
        os.remove(file_path)
        return JsonResponse({'message': 'File deleted successfully'})
    else:
        return JsonResponse({'error': 'File not found'}, status=404)

@api_view(['GET'])
def status_view(request):
    return Response({'status': 'Django Backend Running'})

@api_view(['GET'])
def song_list(request):
    songs = Song.objects.all()
    serializer = SongSerializer(songs, many=True)
    return Response(serializer.data)

@csrf_exempt
@api_view(['GET', 'POST'])
def settings_view(request):
    config_file_path = os.path.join(settings.MEDIA_ROOT, 'settings', 'settingsConfig.json')

    if request.method == 'GET':
        try:
            if not os.path.exists(config_file_path):
                default_config = {
                    'volume': 0.5,
                    'equalizerPreset': 'flat',
                    'playbackSpeed': 1,  # Ensure default value
                    # ...other default settings...
                }
                os.makedirs(os.path.dirname(config_file_path), exist_ok=True)
                with open(config_file_path, 'w') as file:
                    json.dump(default_config, file, indent=2)
                return JsonResponse(default_config)
            else:
                with open(config_file_path, 'r') as file:
                    config = json.load(file)
                return JsonResponse(config)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Error decoding config file'}, status=500)

    elif request.method == 'POST':
        try:
            new_config = json.loads(request.body)
            print("Received JSON:", new_config)  # Debugging line
            if os.path.exists(config_file_path):
                with open(config_file_path, 'r') as file:
                    existing_config = json.load(file)
            else:
                existing_config = {}

            # Merge new settings with existing settings
            existing_config.update(new_config)

            os.makedirs(os.path.dirname(config_file_path), exist_ok=True)
            with open(config_file_path, 'w') as file:
                json.dump(existing_config, file, indent=2)
            return JsonResponse({'message': 'Settings saved successfully'})
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)

class ArtistViewSet(viewsets.ModelViewSet):
    queryset = Artist.objects.all()
    serializer_class = ArtistSerializer

class GenreViewSet(viewsets.ModelViewSet):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer

class AlbumViewSet(viewsets.ModelViewSet):
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer

class SongViewSet(viewsets.ModelViewSet):
    queryset = Song.objects.all()
    serializer_class = SongSerializer