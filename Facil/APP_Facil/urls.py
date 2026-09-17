from django.urls import path
from . import views

urlpatterns = [
    path('temblor/', views.formulario_temblor, name='temblor'),
    path('salida-temblor/<int:temblor_id>/', views.salida_temblor, name='salida_temblor'),
]