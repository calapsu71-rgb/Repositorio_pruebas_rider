from django.shortcuts import render
from .models import Convocatoria
from django.http import HttpResponse


# Esta es la vista para /appsena/app/
def vista_app(request):
    return render(request, 'appsena/main_sena.html')


# Esta es la vista para /appsena/
def index(request):
    return render(request, 'appsena/index.html')


# Esta vista muestra las convocatorias
def convocatorias(request):
    convocatorias = Convocatoria.objects.all()

    return render(
        request,
        'appsena/convocatorias.html',
        {'convocatorias': convocatorias}
    )


# Esta vista crea las convocatorias
def crear_convocatoria(request):

    convocatorias = [
        Convocatoria(
            titulo_capacitacion="Capacitación en Python",
            duracion="2 meses",
            tipo_capacitacion="online",
            detalles="Capacitación en Python para principiantes"
        ),

        Convocatoria(
            titulo_capacitacion="Capacitación en Django",
            duracion="3 meses",
            tipo_capacitacion="presencial",
            detalles="Capacitación en Django para desarrolladores web"
        ),

        Convocatoria(
            titulo_capacitacion="Capacitación en Data Science",
            duracion="4 meses",
            tipo_capacitacion="online",
            detalles="Capacitación en Data Science y Machine Learning"
        )
    ]

    Convocatoria.objects.bulk_create(convocatorias)

    return HttpResponse("Convocatorias creadas exitosamente.")