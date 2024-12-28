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
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Song

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

def ensure_unique_keybinds(keybinds):
    used_keys = set()
    unique_keybinds = {}
    for action, key in keybinds.items():
        if key not in used_keys:
            unique_keybinds[action] = key
            used_keys.add(key)
        else:
            unique_keybinds[action] = None  # Set to None if duplicate
    return unique_keybinds

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
                    'playbackSpeed': 1,
                    'autoplay': True,
                    'keybinds': {
                        'playPause': ' ',
                        'rewind': 'ArrowLeft',
                        'forward': 'ArrowRight',
                        'volumeUp': 'ArrowUp',
                        'volumeDown': 'ArrowDown',
                        'toggleLoop': 'L',
                        'toggleMute': 'M'
                    },
                    'jumpSteps': {
                        'backward': 5000,
                        'forward': 5000
                    },
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
        except json.JSONDecodeError as e:
            print(f"Error decoding config file: {e}")
            return JsonResponse({'error': 'Error decoding config file'}, status=500)
        except Exception as e:
            print(f"Unexpected error: {e}")
            return JsonResponse({'error': 'Unexpected error'}, status=500)

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

            if 'keybinds' in new_config:
                new_config['keybinds'] = ensure_unique_keybinds(new_config['keybinds'])

            os.makedirs(os.path.dirname(config_file_path), exist_ok=True)
            with open(config_file_path, 'w') as file:
                json.dump(existing_config, file, indent=2)
            return JsonResponse({'message': 'Settings saved successfully'})
        except json.JSONDecodeError as e:
            print(f"Invalid JSON: {e}")
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            print(f"Unexpected error: {e}")
            return JsonResponse({'error': 'Unexpected error'}, status=500)

@csrf_exempt
@api_view(['POST'])
def reset_settings_view(request):
    default_config_file_path = os.path.join(settings.MEDIA_ROOT, 'settings', 'defaultSettingsConfig.json')
    config_file_path = os.path.join(settings.MEDIA_ROOT, 'settings', 'settingsConfig.json')

    try:
        with open(default_config_file_path, 'r') as default_file:
            default_config = default_file.read()

        os.makedirs(os.path.dirname(config_file_path), exist_ok=True)
        with open(config_file_path, 'w') as config_file:
            config_file.write(default_config)

        return JsonResponse(json.loads(default_config))
    except Exception as e:
        print(f"Unexpected error: {e}")
        return JsonResponse({'error': 'Unexpected error'}, status=500)

@api_view(['GET'])
def get_album_image(request, title):
    try:
        song = Song.objects.get(title=title)
        if song.albumImage:
            with open(song.albumImage.path, 'rb') as img_file:
                return HttpResponse(img_file.read(), content_type="image/jpeg")
        else:
            return JsonResponse({'error': 'Album image not found'}, status=404)
    except Song.DoesNotExist:
        return JsonResponse({'error': 'Song not found'}, status=404)

@api_view(['GET'])
def get_lyrics(request, title, artist):
    try:
        song = Song.objects.get(title=title, artist=artist)
        if song.lyrics_path:
            with open(song.lyrics_path, 'r') as lyrics_file:
                lyrics = lyrics_file.read()
            return JsonResponse({'lyrics': lyrics})
        else:
            return JsonResponse({'error': 'Lyrics not found'}, status=404)
    except Song.DoesNotExist:
        return JsonResponse({'error': 'Song not found'}, status=404)
