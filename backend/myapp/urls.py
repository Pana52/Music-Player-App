from django.urls import path, include
from .views import list_music_files, get_music_file, status_view, upload_music_file, delete_music_file, settings_view, reset_settings_view, ArtistViewSet, GenreViewSet, AlbumViewSet, SongViewSet
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'artists', ArtistViewSet)
router.register(r'genres', GenreViewSet)
router.register(r'albums', AlbumViewSet)
router.register(r'songs', SongViewSet)

urlpatterns = [
    path('status/', status_view),
    path('songs/', list_music_files),
    path('songs/<str:filename>/', get_music_file),
    path('upload/', upload_music_file),
    path('delete/<str:filename>/', delete_music_file),
    path('settings/', settings_view),
    path('settings/reset/', reset_settings_view),  # Add this line
    path('', include(router.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
