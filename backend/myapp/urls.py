from django.urls import path, include
from .views import list_music_files, get_music_file, status_view, upload_music_file, delete_music_file, settings_view, reset_settings_view, get_album_image, get_lyrics, delete_song
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import routers

router = routers.DefaultRouter()

urlpatterns = [
    path('status/', status_view),
    path('songs/', list_music_files),
    path('songs/<str:filename>/', get_music_file),
    path('upload/', upload_music_file),
    path('delete/<str:filename>/', delete_music_file),
    path('settings/', settings_view),
    path('settings/reset/', reset_settings_view),
    path('album-image/<str:title>/', get_album_image),
    path('lyrics/<str:title>/<str:artist>/', get_lyrics),
    path('delete/<str:filename>/', delete_music_file),
    path('', include(router.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
