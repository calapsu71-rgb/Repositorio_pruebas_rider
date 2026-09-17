from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def bienvenido(request):
    return HttpResponse("<h1>Bienvenido</h1>")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', bienvenido, name='bienvenido'),           
    path('', include('app_repaso.urls')),            
]