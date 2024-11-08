from django.urls import path
from .views import list_music_files, get_music_file, status_view

urlpatterns = [
    path('status/', status_view),
    path('songs/', list_music_files),  # This should be included
    path('songs/<str:filename>/', get_music_file),  # For accessing specific files
]

