"""
URL configuration for myproject project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from myapp.views import home_view, upload_music_file, delete_music_file, run_add_song

urlpatterns = [
    path('', home_view, name='home'),  # Root URL
    path('admin/', admin.site.urls),
    path('api/', include('myapp.urls')),  # This should include myapp's URL patterns
    path('upload/', upload_music_file, name='upload_music_file'),  # Add this line
    path('delete/<str:filename>/', delete_music_file, name='delete_music_file'),  # Add this line
    path('run-add-song/', run_add_song, name='run_add_song'),  # Add this line
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
