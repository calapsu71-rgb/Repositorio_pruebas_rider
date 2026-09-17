from django.urls import path
from . import views

app_name = 'monitor'

urlpatterns = [
    path('', views.dashboard_view, name='dashboard'),
    path('api/sismos/', views.api_sismos_geojson, name='api_sismos'),
]