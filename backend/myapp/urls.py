from django.urls import path
from .views import list_music_files, get_music_file, status_view, artist_details, process_artist_data_view  
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('status/', status_view),
    path('songs/', list_music_files),
    path('songs/<str:filename>/', get_music_file),
    path('artist/<str:artist_name>/', artist_details),  # New endpoint for artist details
    path('process-artist/', process_artist_data_view),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
