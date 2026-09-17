from django.shortcuts import render, redirect, get_object_or_404
from django.db.models import Q
from .models import Temblor

def formulario_temblor(request):
    if request.method == 'POST':
        magnitud = request.POST.get('magnitud')
        profundidad = request.POST.get('profundidad')
        rango = request.POST.get('rango')
        lugar = request.POST.get('lugar')
        area = request.POST.get('area')
        fecha = request.POST.get('fecha')
        hora = request.POST.get('hora')

        temblor = Temblor.objects.create(
            magnitud=magnitud,
            profundidad=profundidad,
            rango=rango,
            lugar=lugar,
            area=area,
            fecha=fecha,
            hora=hora
        )

        return redirect('salida_temblor', temblor_id=temblor.id)

    # Capturar filtros de texto, fecha y hora desde la URL (GET)
    busqueda = request.GET.get('buscar', '')
    fecha_buscar = request.GET.get('fecha_buscar', '')
    hora_buscar = request.GET.get('hora_buscar', '')

    temblores = Temblor.objects.all()

    # Filtrar por texto (lugar, área o rango)
    if busqueda:
        temblores = temblores.filter(
            Q(lugar__icontains=busqueda) |
            Q(area__icontains=busqueda) |
            Q(rango__icontains=busqueda)
        )

    # Filtrar por fecha exacta
    if fecha_buscar:
        temblores = temblores.filter(fecha=fecha_buscar)

    # Filtrar por hora exacta
    if hora_buscar:
        temblores = temblores.filter(hora=hora_buscar)

    temblores = temblores.order_by('-id')

    return render(request, 'APP_Facil/temblor.html', {
        'temblores': temblores,
        'busqueda': busqueda,
        'fecha_buscar': fecha_buscar,
        'hora_buscar': hora_buscar
    })


def salida_temblor(request, temblor_id):
    temblor = get_object_or_404(Temblor, id=temblor_id)
    return render(request, 'APP_Facil/salida-temblor.html', {'temblor': temblor})