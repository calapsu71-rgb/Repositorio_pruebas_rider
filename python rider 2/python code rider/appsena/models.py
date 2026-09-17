from django.db import models


class Convocatoria(models.Model):
    titulo_capacitacion = models.CharField(max_length=255)
    duracion = models.CharField(max_length=100)
    tipo_capacitacion = models.CharField(max_length=100)
    detalles = models.TextField()