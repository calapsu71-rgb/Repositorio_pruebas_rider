from django.shortcuts import render
from django.http import JsonResponse
from django.db.models import Max, Avg
from .models import Sismo
from .services import SismoETLService

def dashboard_view(request):
    # Disparar ingesta de datos al cargar la vista
    SismoETLService.sincronizar_sismos()
    
    total_sismos = Sismo.objects.count()
    sismo_maximo = Sismo.objects.aggregate(Max('magnitud'))['magnitud__max'] or 0.0
    profundidad_prom = Sismo.objects.aggregate(Avg('profundidad'))['profundidad__avg'] or 0.0
    
    context = {
        'total_sismos': total_sismos,
        'magnitud_maxima': round(sismo_maximo, 1),
        'profundidad_promedio': round(profundidad_prom, 2),
        'ultimos_sismos': Sismo.objects.all()[:10]
    }
    return render(request, 'monitor/dashboard.html', context)

def api_sismos_geojson(request):
    min_mag = request.GET.get('min_mag', 2.5)
    try:
        min_mag = float(min_mag)
    except ValueError:
        min_mag = 2.5
        
    qs = Sismo.objects.filter(magnitud__gte=min_mag)
    
    geojson_features = []
    for sismo in qs:
        geojson_features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [sismo.longitud, sismo.latitud, sismo.profundidad]
            },
            "properties": {
                "id": sismo.usgs_id,
                "magnitud": sismo.magnitud,
                "lugar": sismo.lugar,
                "fecha": sismo.fecha_hora.strftime("%Y-%m-%d %H:%M:%S UTC"),
                "profundidad": sismo.profundidad,
                "tsunami": sismo.tsunami,
                "alerta": sismo.alerta
            }
        })
        
    return JsonResponse({
        "type": "FeatureCollection",
        "features": geojson_features
    })