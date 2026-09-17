from django.db import models

class Sismo(models.Model):
    usgs_id = models.CharField(max_length=50, unique=True, db_index=True)
    magnitud = models.FloatField(db_index=True)
    lugar = models.CharField(max_length=255)
    latitud = models.FloatField()
    longitud = models.FloatField()
    profundidad = models.FloatField(help_text="Profundidad en Kilómetros")
    fecha_hora = models.DateTimeField(db_index=True)
    tsunami = models.BooleanField(default=False)
    alerta = models.CharField(max_length=20, default="none")
    estado = models.CharField(max_length=50, default="reviewed")
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-fecha_hora']
        verbose_name = "Sismo"
        verbose_name_plural = "Sismos"

    def __str__(self):
        return f"M {self.magnitud} - {self.lugar} ({self.fecha_hora.strftime('%Y-%m-%d %H:%M')})"