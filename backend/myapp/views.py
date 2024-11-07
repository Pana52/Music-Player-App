from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view

@api_view(['GET'])
def status_view(request):
    return Response({'status': 'Django Backend Running'})

