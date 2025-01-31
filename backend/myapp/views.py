import os
import time
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
from django.shortcuts import get_object_or_404
import subprocess
from django.core.exceptions import ObjectDoesNotExist

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

@api_view(['POST'])
def run_add_song(request):
    data = json.loads(request.body)
    file_path = data.get('file_path')
    if not file_path:
        return JsonResponse({'error': 'No file path provided'}, status=400)

    try:
        # Use the correct Python interpreter from the virtual environment
        python_interpreter = os.path.join(settings.BASE_DIR, 'venv', 'Scripts', 'python.exe')
        result = subprocess.run([python_interpreter, 'manage.py', 'add_song', file_path], capture_output=True, text=True)
        if result.returncode == 0:
            return JsonResponse({'message': 'Song added successfully'})
        else:
            return JsonResponse({'error': result.stderr}, status=500)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['DELETE'])
def delete_song(request, artist, title):
    try:
        # Log the request method
        print(f"Request method: {request.method}")

        record = Song.objects.get(artist=artist, title=title)
        
        # Check if the file exists before attempting to delete it
        if record.file_path and os.path.exists(record.file_path):
            # Ensure the file is not being used by another process
            for _ in range(5):  # Retry up to 5 times
                try:
                    os.remove(record.file_path)
                    break
                except PermissionError:
                    time.sleep(1)  # Wait for 1 second before retrying
            else:
                raise PermissionError(f"File {record.file_path} is being used by another process.")
        
        # Find the lyrics file using the lyrics_path field and delete it
        if record.lyrics_path and os.path.exists(record.lyrics_path):
            os.remove(record.lyrics_path)
        # Find the album image file using the albumImage field and delete it
        if record.albumImage and os.path.exists(record.albumImage.path):
            os.remove(record.albumImage.path)
        # Delete the record from the database
        record.delete()
        
        return JsonResponse({'message': 'Song deleted successfully'})
    except ObjectDoesNotExist:
        return JsonResponse({'error': 'Song not found'}, status=404)
    except PermissionError as e:
        # Log the specific error
        print(f"Permission error deleting song: {e}")
        return JsonResponse({'error': str(e)}, status=500)
    except Exception as e:
        # Log the specific error
        print(f"Error deleting song: {e}")
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['POST'])
def add_to_queue(request):
    try:
        data = json.loads(request.body)
        artist = data.get('artist')
        title = data.get('title')

        if not artist or not title:
            return JsonResponse({'error': 'Artist and title are required'}, status=400)

        song = Song.objects.get(artist=artist, title=title)
        song_id = song.id

        queue_file_path = os.path.join(settings.MEDIA_ROOT, 'queue', 'QueuePlayList.json')
        with open(queue_file_path, 'r') as file:
            queue_data = json.load(file)

        # Generate a unique ID for the queue item
        new_id = max([int(item['id']) for item in queue_data['queue']], default=0) + 1
        queue_data['queue'].append({'id': str(new_id), 'songId': str(song_id)})

        with open(queue_file_path, 'w') as file:
            json.dump(queue_data, file, indent=2)

        return JsonResponse({'message': 'Song added to queue successfully'})
    except Song.DoesNotExist:
        return JsonResponse({'error': 'Song not found'}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        # Log the specific error
        print(f"Error adding song to queue: {e}")
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET'])
def get_queue(request):
    queue_file_path = os.path.join(settings.MEDIA_ROOT, 'queue', 'QueuePlayList.json')
    try:
        with open(queue_file_path, 'r') as file:
            queue_data = json.load(file)
        song_list = []
        for item in queue_data['queue']:
            song = Song.objects.get(id=item['songId'])
            song_list.append({'id': item['id'], 'title': song.title, 'artist': song.artist})
        return JsonResponse({'queue': song_list})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['DELETE'])
def remove_from_queue(request, song_id):
    queue_file_path = os.path.join(settings.MEDIA_ROOT, 'queue', 'QueuePlayList.json')
    try:
        with open(queue_file_path, 'r') as file:
            queue_data = json.load(file)
        queue_data['queue'] = [item for item in queue_data['queue'] if item['id'] != str(song_id)]
        with open(queue_file_path, 'w') as file:
            json.dump(queue_data, file, indent=2)
        return JsonResponse({'message': 'Song removed from queue successfully'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET'])
def get_current_queue_song(request):
    queue_file_path = os.path.join(settings.MEDIA_ROOT, 'queue', 'QueuePlayList.json')
    try:
        with open(queue_file_path, 'r') as file:
            queue_data = json.load(file)
        if not queue_data['queue']:
            return JsonResponse({'message': 'Queue is empty'}, status=404)
        
        # Get the first song in the queue
        first_song = queue_data['queue'].pop(0)
        first_song_id = first_song['songId']
        song = Song.objects.get(id=first_song_id)

        # Save the updated queue back to the file
        with open(queue_file_path, 'w') as file:
            json.dump(queue_data, file, indent=2)

        return JsonResponse({'id': song.id, 'title': song.title, 'artist': song.artist, 'filename': song.file_path.split('/')[-1]})
    except Song.DoesNotExist:
        return JsonResponse({'error': 'Song not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

# copy the QueuePlayList.json file to the SavedPlayList.json file
@api_view(['POST'])
def save_queue(request):
    queue_file_path = os.path.join(settings.MEDIA_ROOT, 'queue', 'QueuePlayList.json')
    saved_file_path = os.path.join(settings.MEDIA_ROOT, 'queue', 'SavedPlayList.json')
    try:
        with open(queue_file_path, 'r') as file:
            queue_data = json.load(file)
        with open(saved_file_path, 'w') as file:
            json.dump(queue_data, file, indent=2)
        return JsonResponse({'message': 'Queue saved successfully'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# copy the SavedPlayList.json file to the QueuePlayList.json file
@api_view(['POST'])
def load_queue(request):
    queue_file_path = os.path.join(settings.MEDIA_ROOT, 'queue', 'QueuePlayList.json')
    saved_file_path = os.path.join(settings.MEDIA_ROOT, 'queue', 'SavedPlayList.json')
    try:
        with open(saved_file_path, 'r') as file:
            queue_data = json.load(file)
        with open(queue_file_path, 'w') as file:
            json.dump(queue_data, file, indent=2)
        return JsonResponse({'message': 'Queue Loaded successfully'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)