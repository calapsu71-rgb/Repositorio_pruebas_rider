from django.urls import path
from . import views

urlpatterns = [
    path('repaso/', views.mi_repaso, name='mi_repaso'),
    path('mi_curso/', views.ver_convocatoria, name='mi_curso'),
    path('mi_curso/crear_mi_curso/', views.crear_curso, name='crear_curso'),
]