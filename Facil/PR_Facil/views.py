
from django.shortcuts import render
from django.http import HttpResponse

def bienvenido_popayan(request):
    return HttpResponse("<h1>Bienvenido a Popayán</h1>")
def inicio(request):
    return render(request, 'evaluacion.html')