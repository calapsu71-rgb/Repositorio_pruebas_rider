from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('code_camilo/', include('app_code_camilo.urls'))
]
