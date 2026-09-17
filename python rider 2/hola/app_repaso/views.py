from django.shortcuts import render
from django.http import HttpResponse  
from .models import mi_curso, lista_cursos 

def mi_repaso(request):
    return render(request, 'app_repaso/mi_repaso.html')

def ver_convocatoria(request):
    cursos = mi_curso.objects.all() 
    return render(request, 'app_repaso/convocatoria.html', {'lista_curso': cursos})

def crear_curso(request):
    mi_curso.objects.bulk_create(lista_cursos)
    return HttpResponse("¡Cursos creados exitosamente!")