from django.db import models

class Temblor(models.Model):
    magnitud = models.FloatField()
    profundidad = models.FloatField()
    rango = models.CharField(max_length=50)
    lugar = models.CharField(max_length=100)
    area = models.CharField(max_length=100)
    fecha = models.DateField()
    hora = models.TimeField()

    def __str__(self):
        return f"{self.lugar} - Magnitud {self.magnitud}"
