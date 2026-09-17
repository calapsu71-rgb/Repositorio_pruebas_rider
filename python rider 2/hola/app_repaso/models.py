from django.db import models

class mi_curso(models.Model):
    instructor = models.CharField(max_length=100)
    competencia = models.CharField(max_length=150)  
    ambiente = models.CharField(max_length=100)     
    aprendiz = models.CharField(max_length=100)                   

    def __str__(self):
        return f"{self.aprendiz} - {self.competencia}"

    

lista_cursos = [
    mi_curso(
        instructor="Carlos Pérez",
        competencia="Desarrollo de Software",
        ambiente="Ambiente 201 - Sistemas",
        aprendiz="Juan Delgado"
    ),
    mi_curso(
        instructor="María Rodríguez",
        competencia="Bases de Datos Relacionales",
        ambiente="Ambiente 104 - Redes",
        aprendiz="Laura Gómez"
    ),
    mi_curso(
        instructor="Andrés López",
        competencia="Pruebas de Software",
        ambiente="Laboratorio 3",
        aprendiz="Sofía Martínez"
    )
]
