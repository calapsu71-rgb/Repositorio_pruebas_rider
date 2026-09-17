from django.shortcuts import render

def vista_app2(request):
    # Nota que buscamos dentro de la carpeta 'appsena2'
    return render(request, 'appsena2/main_sena2.html')