from django.urls import path, include
from .views import list_music_files, get_music_file, status_view, upload_music_file, settings_view, reset_settings_view, get_album_image, get_lyrics, run_add_song, delete_song
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import routers

router = routers.DefaultRouter()

urlpatterns = [
    path('status/', status_view),
    path('songs/', list_music_files),
    path('songs/<str:filename>/', get_music_file),
    path('upload/', upload_music_file),
    path('settings/', settings_view),
    path('settings/reset/', reset_settings_view),
    path('album-image/<str:title>/', get_album_image),
    path('lyrics/<str:title>/<str:artist>/', get_lyrics),
    path('run-add-song/', run_add_song, name='run_add_song'),
    path('songs/delete/<str:filename>/', delete_song, name='delete_song'),
    path('', include(router.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
