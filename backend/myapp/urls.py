from django.urls import path
from .views import list_music_files, get_music_file, status_view, artist_details

urlpatterns = [
    path('status/', status_view),
    path('songs/', list_music_files),
    path('songs/<str:filename>/', get_music_file),
    path('artist/<str:artist_name>/', artist_details),  # New endpoint for artist details
]
