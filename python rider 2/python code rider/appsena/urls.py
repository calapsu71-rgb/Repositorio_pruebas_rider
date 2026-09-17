from django.urls import path
from . import views


urlpatterns = [

    # /appsena/
    path(
        '',
        views.index,
        name='index'
    ),

    # /appsena/app/
    path(
        'app/',
        views.vista_app,
        name='vista_app'
    ),

    # /appsena/crear-convocatorias/
    path(
        'crear-convocatorias/',
        views.crear_convocatoria,
        name='crear_convocatoria'
    ),

    # /appsena/convocatorias/
    path(
        'convocatorias/',
        views.convocatorias,
        name='convocatorias'
    ),
    
]