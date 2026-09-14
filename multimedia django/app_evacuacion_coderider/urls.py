from django.urls import path

from . import views

urlpatterns = [
    path('', views.evacuacion, name='evacuacion'),
    path('panel/', views.panel_coderider, name='panel_coderider'),
]