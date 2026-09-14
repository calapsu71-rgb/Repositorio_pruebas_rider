from django.db import models


class Reporte(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()
    foto = models.ImageField(upload_to='reportes/fotos/', null=True, blank=True)
    documentos = models.FileField(
        upload_to='reportes/documentos/', null=True, blank=True
    )
    audio = models.FileField(
        upload_to='reportes/audios/', null=True, blank=True
    )
    video = models.FileField(
        upload_to='reportes/videos/', null=True, blank=True
    )
    reporte = models.FileField(
        upload_to='reportes/archivos/', null=True, blank=True
    )
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre