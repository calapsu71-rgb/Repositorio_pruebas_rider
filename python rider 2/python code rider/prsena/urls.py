from django.contrib import admin
from django.urls import path, include
from . import views # <--- IMPORTANTE: Importa tus vistas locales aquí

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Esta es la ruta para la página de inicio
    path('', views.vista_inicio, name='inicio'),
    
    # Rutas de tus aplicaciones
    path('appsena/', include('appsena.urls')),
    path('appsena/appsena2/', include('appsena2.urls')),

]