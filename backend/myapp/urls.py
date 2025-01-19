from django.urls import path, include
from .views import list_music_files, get_music_file, status_view, upload_music_file, settings_view, reset_settings_view, get_album_image, get_lyrics, run_add_song, delete_song, add_to_queue, get_queue, remove_from_queue, get_current_queue_song, save_queue, load_queue
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
    path('songs/delete/<str:artist>/<str:title>/', delete_song, name='delete_song'),
    path('add-to-queue/', add_to_queue, name='add_to_queue'),
    path('queue/', get_queue, name='get_queue'),
    path('remove_from_queue/<int:song_id>/', remove_from_queue, name='remove_from_queue'),
    path('current-queue-song/', get_current_queue_song, name='get_current_queue_song'),
    path('save-queue/', save_queue, name='save_queue'),
    path('load-queue/', load_queue, name='load_queue'),
    path('', include(router.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
