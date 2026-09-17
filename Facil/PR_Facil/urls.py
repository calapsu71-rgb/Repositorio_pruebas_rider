from django.contrib import admin
from PR_Facil import views
from django.urls import path, include
from . import views  

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.inicio, name='inicio'), 
    path('Popayan', views.bienvenido_popayan, name='bienvenido_popayan'),
    path('Popayan/', include('APP_Facil.urls')),
]

