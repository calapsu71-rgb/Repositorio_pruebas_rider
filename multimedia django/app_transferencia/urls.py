from django.urls import path
from . import views

urlpatterns = [
    path('transferencia/', views.transferencia, name='transferencia'),
]