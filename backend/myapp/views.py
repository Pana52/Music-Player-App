from django.shortcuts import render
from rest_framework.response import Response
from .models import Song
from .serializers import SongSerializer
from django.http import JsonResponse, HttpResponse  # Import JsonResponse here
from django.conf import settings
from rest_framework.decorators import api_view
import os
from mutagen.mp3 import MP3
from mutagen.id3 import ID3, TIT2, TPE1, TALB

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
    file_path = os.path.join(settings.MEDIA_ROOT, 'music', filename)
    if os.path.exists(file_path):
        with open(file_path, 'rb') as file:
            response = HttpResponse(file.read(), content_type="audio/mpeg")
            response['Content-Disposition'] = f'inline; filename={filename}'
            return response
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

@api_view(['GET'])
def artist_details(request, artist_name):
    from .artist_details import get_artist_details
    try:
        details = get_artist_details(artist_name)
        return JsonResponse(details, safe=False)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
