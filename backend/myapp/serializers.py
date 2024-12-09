from rest_framework import serializers
from .models import Artist, Genre, Album, Song
from django.conf import settings

class ArtistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artist
        fields = '__all__'

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = '__all__'

class AlbumSerializer(serializers.ModelSerializer):
    artist = ArtistSerializer()

    class Meta:
        model = Album
        fields = '__all__'


class SongSerializer(serializers.ModelSerializer):
    artist = serializers.StringRelatedField()
    album = serializers.StringRelatedField()
    genre = serializers.StringRelatedField()
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Song
        fields = ['id', 'title', 'artist', 'album', 'genre', 'duration', 'release_date', 'file_url', 'cover_image']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file:
            return request.build_absolute_uri(obj.file.url) if request else f"{settings.MEDIA_URL}{obj.file.url}"
        return None

    class Meta:
        model = Song
        fields = '__all__'
