import requests
from datetime import datetime, timezone
from .models import Sismo

class SismoETLService:
    USGS_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson"

    @classmethod
    def sincronizar_sismos(cls):
        try:
            response = requests.get(cls.USGS_URL, timeout=10)
            response.raise_for_status()
            payload = response.json()
            
            sismos_creados = 0
            for feature in payload.get('features', []):
                props = feature['properties']
                geom = feature['geometry']
                
                lon, lat, profundidad = geom['coordinates']
                fecha = datetime.fromtimestamp(props['time'] / 1000.0, tz=timezone.utc)
                
                _, created = Sismo.objects.update_or_create(
                    usgs_id=feature['id'],
                    defaults={
                        'magnitud': props.get('mag') or 0.0,
                        'lugar': props.get('place') or 'Ubicación desconocida',
                        'latitud': lat,
                        'longitud': lon,
                        'profundidad': profundidad,
                        'fecha_hora': fecha,
                        'tsunami': bool(props.get('tsunami')),
                        'alerta': props.get('alert') or 'ninguna',
                        'estado': props.get('status') or 'automatic'
                    }
                )
                if created:
                    sismos_creados += 1
                    
            return True, sismos_creados
        except Exception as e:
            print(f"[ETL ERROR] Fallo al sincronizar datos sísmicos: {str(e)}")
            return False, 0