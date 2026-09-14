from django.shortcuts import redirect, render

from .forms import ReporteForm
from .models import Reporte

def panel_coderider(request):
    return render(request, 'app_evacuacion_coderider/panel.html')

def evacuacion(request):
    if request.method == 'POST':
        form = ReporteForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('evacuacion')
    else:
        form = ReporteForm()

    reportes = Reporte.objects.all()
    return render(
        request,
        'app_evacuacion_coderider/evacuacion.html',
        {'form': form, 'reportes': reportes},
    )