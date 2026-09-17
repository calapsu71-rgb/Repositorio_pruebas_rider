from django.http import HttpResponse
from django.urls import path


urlpatterns = [

    path('bienvenido/', lambda request: HttpResponse(
        "<h1>Bienvenido aprendiz, CodeRider <b>dio respuesta</b> desde el archivo urls.py de la aplicación</h1>"
    )),

    path('despedida/', lambda request: HttpResponse(
        "<h1>Adiós querido aprendiz, CodeRider <b>dio respuesta</b> desde el archivo urls.py de la aplicación</h1>"
    )),

]